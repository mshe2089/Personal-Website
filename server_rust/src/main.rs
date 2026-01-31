use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/**
 * ANTI-RUST Node: Systems Core
 * 
 * Leverages Tokio's asynchronous process management to provide real-time 
 * bidirectional communication between the web frontend and a running Rust binary.
 */

#[tokio::main]
async fn main() {
    // Initialize tracing for observability within the Lab environment.
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "server_rust=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Initializing ANTI-RUST Node with Interactive Terminal...");

    // Define the application gateway with specialized routes.
    let app = Router::new()
        .route("/api/v1/rust/ping", get(ping_handler))
        .route("/api/v1/rust/execute", axum::routing::post(execute_handler))
        .route("/api/v1/rust/ws", get(ws_handler)); // High-performance interactive gateway

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("Listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Serialize)]
struct PingResponse {
    status: String,
    message: String,
    version: String,
}

#[derive(Deserialize)]
struct ExecuteRequest {
    code: String,
}

#[derive(Serialize)]
struct ExecuteResponse {
    stdout: String,
    stderr: String,
    success: bool,
}

/// Structured events for WebSocket communication.
#[derive(Serialize)]
#[serde(tag = "type", content = "data")]
enum WsEvent {
    #[serde(rename = "stdout")]
    Stdout(String),
    #[serde(rename = "stderr")]
    Stderr(String),
    #[serde(rename = "system")]
    System(String),
    #[serde(rename = "exit")]
    Exit(String),
}

/// Helper to send JSON events back to the client.
async fn send_event(socket: &mut WebSocket, event: WsEvent) {
    if let Ok(json) = serde_json::to_string(&event) {
        let _ = socket.send(Message::Text(json)).await;
    }
}

/// Simple health check to verify node connectivity.
async fn ping_handler() -> Json<PingResponse> {
    Json(PingResponse {
        status: "success".to_string(),
        message: "Hello from Axum! The Rust Node is operational.".to_string(),
        version: "v1".to_string(),
    })
}

/// Stateless execution handler for short-lived tasks.
async fn execute_handler(Json(payload): Json<ExecuteRequest>) -> Json<ExecuteResponse> {
    use std::fs;
    use std::time::SystemTime;

    let timestamp = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    
    let file_path = format!("/tmp/code_{}.rs", timestamp);
    let bin_path = format!("/tmp/code_{}", timestamp);

    if let Err(e) = fs::write(&file_path, &payload.code) {
        return Json(ExecuteResponse {
            stdout: "".to_string(),
            stderr: format!("Failed to write file: {}", e),
            success: false,
        });
    }

    let compile_output = std::process::Command::new("rustc")
        .arg(&file_path)
        .arg("-o")
        .arg(&bin_path)
        .output();

    let res = match compile_output {
        Ok(output) => {
            if output.status.success() {
                let exec_output = std::process::Command::new(&bin_path).output();
                match exec_output {
                    Ok(exec) => ExecuteResponse {
                        stdout: String::from_utf8_lossy(&exec.stdout).to_string(),
                        stderr: String::from_utf8_lossy(&exec.stderr).to_string(),
                        success: true,
                    },
                    Err(e) => ExecuteResponse {
                        stdout: "".to_string(),
                        stderr: format!("Execution failed: {}", e),
                        success: false,
                    },
                }
            } else {
                ExecuteResponse {
                    stdout: "".to_string(),
                    stderr: String::from_utf8_lossy(&output.stderr).to_string(),
                    success: false,
                }
            }
        }
        Err(e) => ExecuteResponse {
            stdout: "".to_string(),
            stderr: format!("Compilation failed: {}", e),
            success: false,
        },
    };

    let _ = fs::remove_file(&file_path);
    let _ = fs::remove_file(&bin_path);

    Json(res)
}

/// Upgrades the connection to a WebSocket for interactive sessions.
async fn ws_handler(ws: WebSocketUpgrade) -> axum::response::Response {
    ws.on_upgrade(handle_socket)
}

/**
 * handle_socket: The heartbeat of our terminal interaction.
 * 
 * This function manages the lifecycle of a child process, multiplexing 
 * its I/O streams over a single WebSocket connection.
 */
async fn handle_socket(mut socket: WebSocket) {
    // 1. PHASE ONE: INITIATION
    // We wait for the initial payload containing the source code to be executed.
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

    // Prepare temporary workspace for this specific execution unit.
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    
    let file_path = format!("/tmp/interactive_{}.rs", timestamp);
    let bin_path = format!("/tmp/interactive_{}", timestamp);

    if let Err(e) = tokio::fs::write(&file_path, &code).await {
        send_event(&mut socket, WsEvent::System(format!("ERROR: Failed to write file: {}", e))).await;
        return;
    }

    send_event(&mut socket, WsEvent::System("COMPILING...".into())).await;

    // 2. PHASE TWO: COMPILATION
    let compile_output = Command::new("rustc")
        .arg(&file_path)
        .arg("-o")
        .arg(&bin_path)
        .output()
        .await;

    match compile_output {
        Ok(output) if output.status.success() => {
            send_event(&mut socket, WsEvent::System("COMPILATION SUCCESSFUL. STARTING SESSION...\n".into())).await;

            // 3. PHASE THREE: INTERACTIVE EXECUTION
            let mut child = match Command::new(&bin_path)
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn() 
            {
                Ok(c) => c,
                Err(e) => {
                    send_event(&mut socket, WsEvent::System(format!("ERROR: Failed to spawn process: {}", e))).await;
                    return;
                }
            };

            let mut stdin = child.stdin.take().expect("Failed to open stdin");
            let mut stdout = BufReader::new(child.stdout.take().expect("Failed to open stdout"));
            let mut stderr = BufReader::new(child.stderr.take().expect("Failed to open stderr"));

            // 4. PHASE FOUR: I/O MULTIPLEXING
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
                            Some(Ok(Message::Text(input))) => {
                                if stdin.write_all(input.as_bytes()).await.is_err() { break; }
                                if stdin.flush().await.is_err() { break; }
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

    let _ = tokio::fs::remove_file(&file_path).await;
    let _ = tokio::fs::remove_file(&bin_path).await;
}
