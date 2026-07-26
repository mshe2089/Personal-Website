use crate::{AppState, BrushUpdate, CanvasEvent, PixelUpdate};
use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;

const MAX_CANVAS_DIMENSION: usize = 512;
const MAX_CANVAS_PIXELS: usize = 512 * 512;
const MAX_CANVAS_NAME_LENGTH: usize = 48;
const MAX_BATCH_PIXELS: usize = 2048;
const MAX_BRUSH_SIZE: usize = 32;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CanvasInfo {
    pub width: usize,
    pub height: usize,
}

#[derive(Deserialize)]
pub struct CanvasInit {
    pub width: usize,
    pub height: usize,
}

fn get_data_key(name: &str) -> String {
    format!("canvas_data:{}", name)
}

fn get_meta_key(name: &str) -> String {
    format!("canvas_meta:{}", name)
}

fn valid_canvas_name(name: &str) -> bool {
    !name.is_empty()
        && name.len() <= MAX_CANVAS_NAME_LENGTH
        && name
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_')
}

fn canvas_ttl_seconds() -> i64 {
    std::env::var("CANVAS_TTL_SECONDS")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(86_400)
}

async fn refresh_canvas_ttl(
    con: &mut redis::aio::MultiplexedConnection,
    meta_key: &str,
    data_key: &str,
) {
    let ttl = canvas_ttl_seconds();
    let _: redis::RedisResult<()> = redis::pipe()
        .expire(meta_key, ttl)
        .expire(data_key, ttl)
        .query_async(con)
        .await;
}

pub async fn init_canvas(
    State(state): State<Arc<AppState>>,
    Path(name): Path<String>,
    Json(init): Json<CanvasInit>,
) -> impl IntoResponse {
    if !valid_canvas_name(&name)
        || init.width == 0
        || init.height == 0
        || init.width > MAX_CANVAS_DIMENSION
        || init.height > MAX_CANVAS_DIMENSION
    {
        return StatusCode::BAD_REQUEST;
    }

    let canvas_size = match init
        .width
        .checked_mul(init.height)
        .filter(|pixels| *pixels <= MAX_CANVAS_PIXELS)
        .and_then(|pixels| pixels.checked_mul(3))
    {
        Some(size) => size,
        None => return StatusCode::BAD_REQUEST,
    };

    tracing::info!(
        "Canvas [{}]: Initialization request ({}x{})",
        name,
        init.width,
        init.height
    );

    let mut con = match state.redis_client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(e) => {
            tracing::error!("Canvas [{}]: Redis connection fail: {:?}", name, e);
            return StatusCode::INTERNAL_SERVER_ERROR;
        }
    };

    let meta_key = get_meta_key(&name);
    let data_key = get_data_key(&name);

    let exists: bool = con.exists(&meta_key).await.unwrap_or(false);
    if !exists {
        tracing::info!("Canvas [{}]: Creating new board in Redis", name);
        let info = CanvasInfo {
            width: init.width,
            height: init.height,
        };
        let info_json = match serde_json::to_string(&info) {
            Ok(value) => value,
            Err(_) => return StatusCode::INTERNAL_SERVER_ERROR,
        };
        if con.set::<_, _, ()>(&meta_key, info_json).await.is_err() {
            return StatusCode::INTERNAL_SERVER_ERROR;
        }

        let empty_canvas = vec![255u8; canvas_size];
        if con.set::<_, _, ()>(&data_key, empty_canvas).await.is_err() {
            let _: redis::RedisResult<()> = con.del(&meta_key).await;
            return StatusCode::INTERNAL_SERVER_ERROR;
        }
    }

    refresh_canvas_ttl(&mut con, &meta_key, &data_key).await;
    StatusCode::OK
}

pub async fn get_canvas_info(
    State(state): State<Arc<AppState>>,
    Path(name): Path<String>,
) -> impl IntoResponse {
    if !valid_canvas_name(&name) {
        return (StatusCode::BAD_REQUEST, "Invalid canvas name").into_response();
    }
    let mut con = match state.redis_client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Redis unreachable").into_response(),
    };

    let meta_key = get_meta_key(&name);
    let meta_data: String = match con.get(&meta_key).await {
        Ok(d) => d,
        Err(_) => return (StatusCode::NOT_FOUND, "Canvas not found").into_response(),
    };

    let info: CanvasInfo = match serde_json::from_str(&meta_data) {
        Ok(info) => info,
        Err(_) => {
            return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid canvas metadata").into_response()
        }
    };
    Json(info).into_response()
}

pub async fn get_canvas_data(
    State(state): State<Arc<AppState>>,
    Path(name): Path<String>,
) -> impl IntoResponse {
    if !valid_canvas_name(&name) {
        return (StatusCode::BAD_REQUEST, "Invalid canvas name").into_response();
    }
    let mut con = match state.redis_client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, "Redis unreachable").into_response(),
    };

    let data_key = get_data_key(&name);
    let canvas_data: Vec<u8> = match con.get(data_key).await {
        Ok(d) => d,
        Err(_) => return (StatusCode::NOT_FOUND, "Canvas data not found").into_response(),
    };

    canvas_data.into_response()
}

pub async fn update_pixel(
    State(state): State<Arc<AppState>>,
    Path(name): Path<String>,
    Json(update): Json<PixelUpdate>,
) -> impl IntoResponse {
    if !valid_canvas_name(&name) {
        return StatusCode::BAD_REQUEST;
    }
    let mut con = match state.redis_client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR,
    };

    let meta_key = get_meta_key(&name);
    let meta_data: String = match con.get(&meta_key).await {
        Ok(d) => d,
        Err(_) => return StatusCode::NOT_FOUND,
    };
    let info: CanvasInfo = match serde_json::from_str(&meta_data) {
        Ok(info) => info,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR,
    };

    if update.x >= info.width || update.y >= info.height {
        return StatusCode::BAD_REQUEST;
    }

    let offset = (update.y * info.width + update.x) * 3;
    let color_data = [update.r, update.g, update.b];
    let data_key = get_data_key(&name);

    if con
        .setrange::<_, _, ()>(&data_key, offset as isize, &color_data)
        .await
        .is_err()
    {
        return StatusCode::INTERNAL_SERVER_ERROR;
    }
    refresh_canvas_ttl(&mut con, &meta_key, &data_key).await;

    if let Some(tx) = state.canvas_channels.get(&name) {
        let _ = tx.send(CanvasEvent::Pixel(update));
    }

    StatusCode::OK
}

pub async fn handle_ws(
    Path(name): Path<String>,
    State(state): State<Arc<AppState>>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    if !valid_canvas_name(&name) {
        return StatusCode::BAD_REQUEST.into_response();
    }
    tracing::info!("Canvas [{}]: WebSocket upgrade request", name);
    ws.on_upgrade(move |socket| stream_canvas_updates(socket, state, name))
}

async fn apply_batch(state: &Arc<AppState>, name: &str, pixels: Vec<PixelUpdate>) {
    if pixels.is_empty() || pixels.len() > MAX_BATCH_PIXELS {
        return;
    }
    let mut con = match state.redis_client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(_) => return,
    };

    let meta_key = get_meta_key(name);
    let meta_data: String = match con.get(&meta_key).await {
        Ok(d) => d,
        Err(_) => return,
    };
    let info: CanvasInfo = match serde_json::from_str(&meta_data) {
        Ok(info) => info,
        Err(_) => return,
    };
    let data_key = get_data_key(name);

    let mut pipe = redis::pipe();
    let mut has_updates = false;

    for update in &pixels {
        if update.x < info.width && update.y < info.height {
            let offset = (update.y * info.width + update.x) * 3;
            let color_data = [update.r, update.g, update.b];
            pipe.cmd("SETRANGE")
                .arg(&data_key)
                .arg(offset)
                .arg(&color_data)
                .ignore();
            has_updates = true;
        }
    }

    if has_updates {
        let _: () = pipe.query_async(&mut con).await.unwrap_or(());
        refresh_canvas_ttl(&mut con, &meta_key, &data_key).await;
    }

    if let Some(tx) = state.canvas_channels.get(name) {
        let _ = tx.send(CanvasEvent::Batch(pixels));
    }
}

async fn apply_brush(state: &Arc<AppState>, name: &str, brush: BrushUpdate) {
    if brush.radius == 0 || brush.radius > MAX_BRUSH_SIZE {
        return;
    }
    let mut con = match state.redis_client.get_multiplexed_async_connection().await {
        Ok(c) => c,
        Err(_) => return,
    };

    let meta_key = get_meta_key(name);
    let meta_data: String = match con.get(&meta_key).await {
        Ok(d) => d,
        Err(_) => return,
    };
    let info: CanvasInfo = match serde_json::from_str(&meta_data) {
        Ok(info) => info,
        Err(_) => return,
    };
    let data_key = get_data_key(name);

    let mut pipe = redis::pipe();
    let mut pixels = Vec::new();

    // Standardize: Radius is half the brush size (diameter) to match UI interpretation
    let radius = (brush.radius as f32 / 2.0) as i32;
    let cx = brush.x as i32;
    let cy = brush.y as i32;
    let r_sq = radius * radius;

    for dy in -radius..=radius {
        for dx in -radius..=radius {
            if dx * dx + dy * dy <= r_sq {
                let px = cx + dx;
                let py = cy + dy;

                if px >= 0 && px < info.width as i32 && py >= 0 && py < info.height as i32 {
                    let pixel = PixelUpdate {
                        x: px as usize,
                        y: py as usize,
                        r: brush.r,
                        g: brush.g,
                        b: brush.b,
                    };

                    let offset = (py as usize * info.width + px as usize) * 3;
                    let color_data = [brush.r, brush.g, brush.b];
                    pipe.cmd("SETRANGE")
                        .arg(&data_key)
                        .arg(offset)
                        .arg(&color_data)
                        .ignore();
                    pixels.push(pixel);
                }
            }
        }
    }

    if !pixels.is_empty() {
        let _: () = pipe.query_async(&mut con).await.unwrap_or(());
        refresh_canvas_ttl(&mut con, &meta_key, &data_key).await;
    }

    // BROADCAST: Send the original brush intent to all clients for symmetric rendering
    if let Some(tx) = state.canvas_channels.get(name) {
        let _ = tx.send(CanvasEvent::Brush(brush));
    }
}

async fn stream_canvas_updates(mut socket: WebSocket, state: Arc<AppState>, name: String) {
    tracing::info!("Canvas [{}]: WebSocket connection OPENED", name);

    let tx = state
        .canvas_channels
        .entry(name.clone())
        .or_insert_with(|| {
            let (tx, _) = broadcast::channel(1024);
            tx
        })
        .clone();

    let mut rx = tx.subscribe();

    loop {
        tokio::select! {
            ws_msg = socket.recv() => {
                match ws_msg {
                    Some(Ok(Message::Text(text))) => {
                        if let Ok(event) = serde_json::from_str::<CanvasEvent>(&text) {
                            match event {
                                CanvasEvent::Pixel(u) => {
                                    apply_batch(&state, &name, vec![u]).await;
                                }
                                CanvasEvent::Batch(pixels) => {
                                    apply_batch(&state, &name, pixels).await;
                                }
                                CanvasEvent::Brush(brush) => {
                                    apply_brush(&state, &name, brush).await;
                                }
                            }
                        }
                    }
                    Some(Ok(_)) => (),
                    _ => break,
                }
            }

            result = rx.recv() => {
                match result {
                    Ok(event) => {
                        let msg = match serde_json::to_string(&event) {
                            Ok(s) => s,
                            Err(_) => break,
                        };
                        if socket.send(Message::Text(msg)).await.is_err() {
                            break;
                        }
                    }
                    Err(broadcast::error::RecvError::Closed) => break,
                    Err(broadcast::error::RecvError::Lagged(count)) => {
                        tracing::warn!("Canvas [{}]: Stream lagging (skipped {} updates)", name, count);
                    }
                }
            }
        }
    }

    if tx.receiver_count() == 0 {
        state.canvas_channels.remove(&name);
    }
    tracing::info!("Canvas [{}]: WebSocket connection CLOSED", name);
}
