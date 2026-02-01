use axum::extract::ws::{Message, WebSocket};
use serde::{Deserialize, Serialize};
use std::fs;
use std::os::unix::process::CommandExt;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;
use nix::sys::resource::{setrlimit, Resource};
use uuid::Uuid;

/// Security: Set resource limits for child processes
/// This prevents fork bombs, memory exhaustion, and CPU hogging
unsafe fn set_child_rlimits() {
    // CPU time limit: 10 seconds
    let _ = setrlimit(Resource::RLIMIT_CPU, 10, 10);
    // Virtual memory limit: 128MB
    let _ = setrlimit(Resource::RLIMIT_AS, 128_000_000, 128_000_000);
    // Max processes: 20
    let _ = setrlimit(Resource::RLIMIT_NPROC, 20, 20);
    // Max file size: 10MB
    let _ = setrlimit(Resource::RLIMIT_FSIZE, 10_000_000, 10_000_000);
}

#[derive(Deserialize)]
pub struct ExecuteRequest {
    pub code: String,
}

#[derive(Serialize)]
#[serde(tag = "type", content = "data")]
pub enum WsEvent {
    #[serde(rename = "system")]
    System(String),
    #[serde(rename = "stdout")]
    Stdout(String),
    #[serde(rename = "stderr")]
    Stderr(String),
    #[serde(rename = "exit")]
    Exit(String),
}

async fn send_event(socket: &mut WebSocket, event: WsEvent) {
    if let Ok(json) = serde_json::to_string(&event) {
        let _ = socket.send(Message::Text(json)).await;
    }
}

/// Execute user-submitted Rust code in a sandboxed environment
/// 
/// Security features:
/// - Isolated workspace per execution
/// - Runs as unprivileged user (UID 1000)
/// - Resource limits (CPU, memory, processes, file size)
/// - Automatic cleanup
pub async fn execute_user_code(mut socket: WebSocket) {
    send_event(&mut socket, WsEvent::System("RUST EXECUTION NODE ACTIVE".into())).await;

    // Wait for the initial payload containing the source code
    let code = match socket.recv().await {
        Some(Ok(Message::Text(text))) => {
            match serde_json::from_str::<ExecuteRequest>(&text) {
                Ok(req) => req.code,
                Err(_) => {
                    send_event(&mut socket, WsEvent::System("ERROR: Invalid JSON payload".into())).await;
                    return;
                }
            }
        }
        _ => return,
    };

    // Create isolated workspace for this execution
    let execution_id = Uuid::new_v4();
    let workspace_dir = format!("/tmp/rust-exec-{}", execution_id);
    
    if let Err(e) = fs::create_dir_all(&workspace_dir) {
        send_event(&mut socket, WsEvent::System(format!("ERROR: Failed to create workspace: {}", e))).await;
        return;
    }
    
    let file_path = format!("{}/main.rs", workspace_dir);
    let bin_path = format!("{}/main", workspace_dir);

    if let Err(e) = tokio::fs::write(&file_path, &code).await {
        send_event(&mut socket, WsEvent::System(format!("ERROR: Failed to write file: {}", e))).await;
        let _ = fs::remove_dir_all(&workspace_dir);
        return;
    }

    send_event(&mut socket, WsEvent::System("COMPILING...".into())).await;

    // Compile the user code
    let compile_output = Command::new("rustc")
        .arg(&file_path)
        .arg("-o")
        .arg(&bin_path)
        .output()
        .await;

    match compile_output {
        Ok(output) if output.status.success() => {
            send_event(&mut socket, WsEvent::System("COMPILATION SUCCESSFUL. STARTING SESSION...\n".into())).await;

            // Spawn process with security hardening
            let mut child = unsafe {
                match Command::new(&bin_path)
                    .stdin(Stdio::piped())
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped())
                    .uid(1000)  // Run as rustuser
                    .gid(1000)
                    .pre_exec(|| {
                        // Set resource limits before exec
                        set_child_rlimits();
                        Ok(())
                    })
                    .spawn() 
                {
                    Ok(c) => c,
                    Err(e) => {
                        send_event(&mut socket, WsEvent::System(format!("ERROR: Failed to spawn process: {}", e))).await;
                        let _ = fs::remove_dir_all(&workspace_dir);
                        return;
                    }
                }
            };

            let mut stdin = child.stdin.take().expect("Failed to open stdin");
            let mut stdout = BufReader::new(child.stdout.take().expect("Failed to open stdout"));
            let mut stderr = BufReader::new(child.stderr.take().expect("Failed to open stderr"));

            // I/O multiplexing loop
            loop {
                let mut stdout_line = String::new();
                let mut stderr_line = String::new();

                tokio::select! {
                    // Stream STDOUT from process to client
                    res = stdout.read_line(&mut stdout_line) => {
                        match res {
                            Ok(0) | Err(_) => break,
                            Ok(_) => {
                                if let Ok(json) = serde_json::to_string(&WsEvent::Stdout(stdout_line)) {
                                    if socket.send(Message::Text(json)).await.is_err() { break; }
                                }
                            }
                        }
                    }
                    // Stream STDERR from process to client
                    res = stderr.read_line(&mut stderr_line) => {
                        match res {
                            Ok(0) | Err(_) => break,
                            Ok(_) => {
                                if let Ok(json) = serde_json::to_string(&WsEvent::Stderr(stderr_line)) {
                                    if socket.send(Message::Text(json)).await.is_err() { break; }
                                }
                            }
                        }
                    }
                    // Receive STDIN from client and forward to process
                    msg = socket.recv() => {
                        match msg {
                            Some(Ok(Message::Text(text))) => {
                                // Deserialize JSON string if present
                                let input_bytes = if let Ok(decoded) = serde_json::from_str::<String>(&text) {
                                    decoded.into_bytes()
                                } else {
                                    text.into_bytes()
                                };
                                
                                if stdin.write_all(&input_bytes).await.is_err() { break; }
                                if stdin.flush().await.is_err() { break; }
                            }
                            Some(Ok(Message::Close(_))) => {
                                send_event(&mut socket, WsEvent::System(">> PROCESS KILLED BY USER".into())).await;
                                let _ = child.kill().await;
                                break;
                            }
                            _ => break,
                        }
                    }
                    // Handle process exit
                    status = child.wait() => {
                        let exit_msg = match status {
                            Ok(s) => format!("Process exited with status: {}", s),
                            Err(e) => format!("Process failed: {}", e),
                        };
                        if let Ok(json) = serde_json::to_string(&WsEvent::Exit(exit_msg)) {
                            let _ = socket.send(Message::Text(json)).await;
                        }
                        break;
                    }
                }
            }

            let _ = child.kill().await;
        }
        Ok(output) => {
            let err_msg = String::from_utf8_lossy(&output.stderr).to_string();
            send_event(&mut socket, WsEvent::System(format!("COMPILATION ERROR:\n{}", err_msg))).await;
        }
        Err(e) => {
            send_event(&mut socket, WsEvent::System(format!("SYSTEM ERROR: {}", e))).await;
        }
    }

    // Cleanup: Remove isolated workspace directory
    let _ = fs::remove_dir_all(&workspace_dir);
}
