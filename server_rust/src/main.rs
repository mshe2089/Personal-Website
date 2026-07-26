use axum::{
    extract::DefaultBodyLimit,
    routing::{get, post},
    Json, Router,
};
use dashmap::DashMap;
use serde::Serialize;
use server_rust::{canvas, AppState};
use std::{net::SocketAddr, sync::Arc};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://redis:6379".to_string());
    let state = Arc::new(AppState {
        redis_client: redis::Client::open(redis_url).expect("Invalid Redis URL"),
        canvas_channels: DashMap::new(),
    });

    let api = Router::new()
        .route("/rust/ping", get(health_check))
        .route("/rust/canvas/:name/init", post(canvas::init_canvas))
        .route("/rust/canvas/:name/info", get(canvas::get_canvas_info))
        .route("/rust/canvas/:name/data", get(canvas::get_canvas_data))
        .route("/rust/canvas/:name/pixel", post(canvas::update_pixel))
        .route("/rust/canvas/:name/ws", get(canvas::handle_ws))
        .layer(DefaultBodyLimit::max(64 * 1024))
        .with_state(state);

    let address = SocketAddr::from(([0, 0, 0, 0], 8000));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("Failed to bind HTTP listener");

    tracing::info!("Rust canvas service listening on {address}");
    axum::serve(listener, Router::new().nest("/api/v1", api))
        .await
        .expect("Rust HTTP server failed");
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "online",
        service: "rust-canvas",
    })
}
