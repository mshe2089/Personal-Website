use axum::extract::ws::{Message, WebSocket};
use bollard::container::{
    Config, CreateContainerOptions, LogOutput, RemoveContainerOptions, StartContainerOptions,
};
use bollard::exec::{CreateExecOptions, StartExecResults};
use bollard::Docker;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::env;
use std::time::Duration;
use tokio::io::AsyncWriteExt;
use uuid::Uuid;

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

/// Execute user-submitted Rust code in an ephemeral Docker container
///
/// Security features:
/// - Isolated container per execution
/// - No network access
/// - Read-only filesystem (except /workspace tmpfs)
/// - Resource limits (CPU, memory, processes)
/// - Automatic cleanup after execution
/// - Seccomp profile restrictions
pub async fn execute_user_code(mut socket: WebSocket) {
    send_event(
        &mut socket,
        WsEvent::System("RUST EXECUTION NODE ACTIVE".into()),
    )
    .await;

    // Wait for the initial payload containing the source code
    let code = match socket.recv().await {
        Some(Ok(Message::Text(text))) => match serde_json::from_str::<ExecuteRequest>(&text) {
            Ok(req) => req.code,
            Err(_) => {
                send_event(
                    &mut socket,
                    WsEvent::System("ERROR: Invalid JSON payload".into()),
                )
                .await;
                return;
            }
        },
        _ => return,
    };

    // Connect to Docker daemon
    let docker = match Docker::connect_with_socket_defaults() {
        Ok(d) => d,
        Err(e) => {
            send_event(
                &mut socket,
                WsEvent::System(format!("ERROR: Failed to connect to Docker: {}", e)),
            )
            .await;
            return;
        }
    };

    // Get configuration from environment
    let runner_image = env::var("RUNNER_IMAGE").unwrap_or_else(|_| "personal-website-rust-runner".to_string());
    let _runner_network = env::var("RUNNER_NETWORK").ok();
    
    let execution_id = Uuid::new_v4();
    let container_name = format!("rust-exec-{}", execution_id);

    // Create ephemeral container
    let config = Config {
        image: Some(runner_image.clone()),
        user: Some("rustuser".to_string()),
        cmd: Some(vec!["sleep".to_string(), "infinity".to_string()]),
        working_dir: Some("/workspace".to_string()),
        host_config: Some(bollard::models::HostConfig {
            memory: Some(128 * 1024 * 1024), // 128MB
            nano_cpus: Some(500_000_000),    // 0.5 CPU
            pids_limit: Some(50),
            network_mode: Some("none".to_string()), // No network access
            readonly_rootfs: Some(true),
            tmpfs: Some(
                [
                    ("/workspace".to_string(), "exec,nosuid,size=100M,uid=1000,gid=1000".to_string()),
                    ("/tmp".to_string(), "exec,nosuid,size=100M,uid=1000,gid=1000".to_string()),
                ]
                .iter()
                .cloned()
                .collect(),
            ),
            security_opt: Some(vec![
                "no-new-privileges:true".to_string(),
            ]),
            cap_drop: Some(vec!["ALL".to_string()]),
            ..Default::default()
        }),
        ..Default::default()
    };

    let container = match docker
        .create_container(
            Some(CreateContainerOptions {
                name: container_name.clone(),
                platform: None,
            }),
            config,
        )
        .await
    {
        Ok(c) => c,
        Err(e) => {
            send_event(
                &mut socket,
                WsEvent::System(format!("ERROR: Failed to create container: {}", e)),
            )
            .await;
            return;
        }
    };

    // Start the container
    if let Err(e) = docker
        .start_container(&container.id, None::<StartContainerOptions<String>>)
        .await
    {
        send_event(
            &mut socket,
            WsEvent::System(format!("ERROR: Failed to start container: {}", e)),
        )
        .await;
        let _ = docker
            .remove_container(
                &container.id,
                Some(RemoveContainerOptions {
                    force: true,
                    ..Default::default()
                }),
            )
            .await;
        return;
    }

    // Write source code to container
    let file_path = "/workspace/main.rs";
    let cat_command = format!("cat > {}", file_path);
    let write_code_exec = CreateExecOptions {
        cmd: Some(vec!["sh".to_string(), "-c".to_string(), cat_command]),
        attach_stdin: Some(true),
        attach_stdout: Some(true),
        attach_stderr: Some(true),
        ..Default::default()
    };

    let exec = match docker.create_exec(&container.id, write_code_exec).await {
        Ok(e) => e,
        Err(e) => {
            send_event(
                &mut socket,
                WsEvent::System(format!("ERROR: Failed to write code: {}", e)),
            )
            .await;
            cleanup_container(&docker, &container.id).await;
            return;
        }
    };

    if let StartExecResults::Attached { mut input, .. } =
        docker.start_exec(&exec.id, None).await.unwrap()
    {
        let _ = input.write_all(code.as_bytes()).await;
        let _ = input.shutdown().await;
    }

    send_event(&mut socket, WsEvent::System("COMPILING...".into())).await;

    // Compile the code
    let compile_exec = CreateExecOptions {
        cmd: Some(vec![
            "rustc".to_string(),
            file_path.to_string(),
            "-o".to_string(),
            "/workspace/main".to_string(),
        ]),
        attach_stdout: Some(true),
        attach_stderr: Some(true),
        ..Default::default()
    };

    let compile = match docker.create_exec(&container.id, compile_exec).await {
        Ok(e) => e,
        Err(e) => {
            send_event(
                &mut socket,
                WsEvent::System(format!("ERROR: Compilation setup failed: {}", e)),
            )
            .await;
            cleanup_container(&docker, &container.id).await;
            return;
        }
    };

    if let StartExecResults::Attached { output, .. } =
        docker.start_exec(&compile.id, None).await.unwrap()
    {
        let logs: Vec<_> = output.collect().await;
        let mut compile_success = true;
        let mut error_output = String::new();

        for log in logs {
            match log {
                Ok(LogOutput::StdErr { message }) => {
                    let text = String::from_utf8_lossy(&message).to_string();
                    tracing::debug!("Compilation Stderr: {}", text);
                    error_output.push_str(&text);
                    compile_success = false;
                }
                Ok(LogOutput::StdOut { message }) => {
                    let text = String::from_utf8_lossy(&message).to_string();
                    tracing::debug!("Compilation Stdout: {}", text);
                }
                _ => {}
            }
        }

        if !compile_success {
            send_event(
                &mut socket,
                WsEvent::System(format!("COMPILATION ERROR:\n{}", error_output)),
            )
            .await;
            cleanup_container(&docker, &container.id).await;
            return;
        }
    }

    send_event(
        &mut socket,
        WsEvent::System("COMPILATION SUCCESSFUL. STARTING SESSION...\n".into()),
    )
    .await;

    // Execute the compiled binary with timeout
    let run_exec = CreateExecOptions {
        cmd: Some(vec!["/workspace/main".to_string()]),
        attach_stdin: Some(true),
        attach_stdout: Some(true),
        attach_stderr: Some(true),
        ..Default::default()
    };

    let run = match docker.create_exec(&container.id, run_exec).await {
        Ok(e) => e,
        Err(e) => {
            send_event(
                &mut socket,
                WsEvent::System(format!("ERROR: Execution setup failed: {}", e)),
            )
            .await;
            cleanup_container(&docker, &container.id).await;
            return;
        }
    };

    // Start execution with I/O streaming
    match docker.start_exec(&run.id, None).await {
        Ok(StartExecResults::Attached {
            mut output,
            mut input,
        }) => {
            // Split the websocket so we can use it concurrently
            let (mut ws_sender, mut ws_receiver) = socket.split();
            let start_time = std::time::Instant::now();
            let timeout_duration = Duration::from_secs(10);

            loop {
                let elapsed = start_time.elapsed();
                if elapsed >= timeout_duration {
                    let event = WsEvent::Exit("Process terminated: 10 second timeout exceeded".to_string());
                    if let Ok(json) = serde_json::to_string(&event) {
                        let _ = ws_sender.send(Message::Text(json)).await;
                    }
                    break;
                }

                tokio::select! {
                    // Stream output from container to client
                    log_opt = output.next() => {
                        match log_opt {
                            Some(Ok(LogOutput::StdOut { message })) => {
                                let text = String::from_utf8_lossy(&message).to_string();
                                if let Ok(json) = serde_json::to_string(&WsEvent::Stdout(text)) {
                                    if ws_sender.send(Message::Text(json)).await.is_err() { break; }
                                }
                            }
                            Some(Ok(LogOutput::StdErr { message })) => {
                                let text = String::from_utf8_lossy(&message).to_string();
                                if let Ok(json) = serde_json::to_string(&WsEvent::Stderr(text)) {
                                    if ws_sender.send(Message::Text(json)).await.is_err() { break; }
                                }
                            }
                            Some(Ok(_)) => {} // Ignore other successful variants (StdIn, Console)
                            Some(Err(_)) | None => break, // Exit loop when process finishes or stream breaks
                        }
                    }
                    // Receive input from client and forward to container
                    msg = ws_receiver.next() => {
                        match msg {
                            Some(Ok(Message::Text(text))) => {
                                let input_bytes = if let Ok(decoded) = serde_json::from_str::<String>(&text) {
                                    decoded.into_bytes()
                                } else {
                                    text.into_bytes()
                                };
                                if input.write_all(&input_bytes).await.is_err() { break; }
                            }
                            Some(Ok(Message::Close(_))) => {
                                let event = WsEvent::System(">> PROCESS KILLED BY USER".into());
                                if let Ok(json) = serde_json::to_string(&event) {
                                    let _ = ws_sender.send(Message::Text(json)).await;
                                }
                                break;
                            }
                            _ => break,
                        }
                    }
                    // Overall timeout
                    _ = tokio::time::sleep(timeout_duration.saturating_sub(elapsed)) => {
                        let event = WsEvent::Exit("Process terminated: 10 second timeout exceeded".to_string());
                        if let Ok(json) = serde_json::to_string(&event) {
                            let _ = ws_sender.send(Message::Text(json)).await;
                        }
                        break;
                    }
                }
            }

            // Final exit message
            let event = WsEvent::Exit("Process completed".to_string());
            if let Ok(json) = serde_json::to_string(&event) {
                let _ = ws_sender.send(Message::Text(json)).await;
            }
        }
        _ => {
            send_event(
                &mut socket,
                WsEvent::System("ERROR: Failed to attach to execution".into()),
            )
            .await;
        }
    }

    // Cleanup
    cleanup_container(&docker, &container.id).await;
}

async fn cleanup_container(docker: &Docker, container_id: &str) {
    let _ = docker
        .remove_container(
            container_id,
            Some(RemoveContainerOptions {
                force: true,
                ..Default::default()
            }),
        )
        .await;
}
