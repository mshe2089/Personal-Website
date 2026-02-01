mod runner;

use axum::{
    extract::ws::WebSocketUpgrade,
    routing::get,
    Json, Router,
};
use serde::Serialize;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

/**
 * ANTI-RUST Node: Systems Core
 * 
 * Axum web server providing HTTP and WebSocket endpoints for the Rust Playground.
 * Execution logic is delegated to the runner module for security isolation.
 */

#[tokio::main]
async fn main() {
    // Initialize tracing for observability
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "server_rust=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Initializing ANTI-RUST Node with Interactive Terminal...");

    // Define the application gateway
    let app = Router::new()
        .route("/api/v1/rust/ping", get(ping_handler))
        .route("/api/v1/rust/ws", get(ws_handler));

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

/// Health check endpoint
async fn ping_handler() -> Json<PingResponse> {
    Json(PingResponse {
        status: "online".to_string(),
        message: "ANTI-RUST Node operational. Interactive terminal ready.".to_string(),
        version: "2.0.0-secure".to_string(),
    })
}

/// WebSocket handler - delegates to runner module
async fn ws_handler(ws: WebSocketUpgrade) -> axum::response::Response {
    ws.on_upgrade(|socket| async move {
        runner::execute_user_code(socket).await;
    })
}
