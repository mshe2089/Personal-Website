# --- STAGE 0: Chef ---
FROM lukemathwalker/cargo-chef:latest-rust-1.85-slim AS chef
WORKDIR /usr/src/app

# --- STAGE 1: Planner ---
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# --- STAGE 2: Cacher ---
FROM chef AS cacher
COPY --from=planner /usr/src/app/recipe.json recipe.json
# Build dependencies - this layer is cached until Cargo.toml/Cargo.lock changes
RUN cargo chef cook --release --recipe-path recipe.json

# --- STAGE 3: Builder ---
FROM rust:1.85-slim AS builder
WORKDIR /usr/src/app
COPY . .
# Copy pre-compiled dependencies from cacher
COPY --from=cacher /usr/src/app/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
# Build the actual application
RUN cargo build --release

# --- STAGE 4: Final Runtime ---
FROM debian:bookworm-slim
WORKDIR /app
RUN useradd --create-home --uid 10001 appuser
COPY --from=builder /usr/src/app/target/release/server_rust /usr/local/bin/server_rust
USER appuser

EXPOSE 8000
CMD ["server_rust"]
