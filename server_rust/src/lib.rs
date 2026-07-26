pub mod canvas;

use dashmap::DashMap;
use tokio::sync::broadcast;

pub struct AppState {
    pub redis_client: redis::Client,
    pub canvas_channels: DashMap<String, broadcast::Sender<CanvasEvent>>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct PixelUpdate {
    pub x: usize,
    pub y: usize,
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct BrushUpdate {
    pub x: usize,
    pub y: usize,
    pub radius: usize,
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(tag = "type", content = "data")]
pub enum CanvasEvent {
    #[serde(rename = "pixel")]
    Pixel(PixelUpdate),
    #[serde(rename = "batch")]
    Batch(Vec<PixelUpdate>),
    #[serde(rename = "brush")]
    Brush(BrushUpdate),
}
