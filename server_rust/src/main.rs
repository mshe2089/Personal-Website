use axum::{
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Initialize tracing (logging)
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "server_rust=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Initializing ANTI-RUST Node...");

    // Build our application with routes
    let app = Router::new()
        .route("/api/v1/rust/ping", get(ping_handler))
        .route("/api/v1/rust/execute", axum::routing::post(execute_handler));

    // Run it
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

async fn ping_handler() -> Json<PingResponse> {
    Json(PingResponse {
        status: "success".to_string(),
        message: "Hello from Axum! The Rust Node is operational.".to_string(),
        version: "v1".to_string(),
    })
}

async fn execute_handler(Json(payload): Json<ExecuteRequest>) -> Json<ExecuteResponse> {
    use std::process::Command;
    use std::fs;
    use std::time::SystemTime;

    let timestamp = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    
    let file_path = format!("/tmp/code_{}.rs", timestamp);
    let bin_path = format!("/tmp/code_{}", timestamp);

    // 1. Write code to file
    if let Err(e) = fs::write(&file_path, &payload.code) {
        return Json(ExecuteResponse {
            stdout: "".to_string(),
            stderr: format!("Failed to write file: {}", e),
            success: false,
        });
    }

    // 2. Compile with rustc
    let compile_output = Command::new("rustc")
        .arg(&file_path)
        .arg("-o")
        .arg(&bin_path)
        .output();

    let res = match compile_output {
        Ok(output) => {
            if output.status.success() {
                // 3. Execute the binary
                let exec_output = Command::new(&bin_path).output();
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

    // Cleanup
    let _ = fs::remove_file(&file_path);
    let _ = fs::remove_file(&bin_path);

    Json(res)
}
