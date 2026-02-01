# Use the official Rust image as a builder
FROM rust:slim AS builder

WORKDIR /usr/src/app
COPY . .

# Build the application
RUN cargo build --release

# Final runtime image
FROM rust:slim

WORKDIR /app

# Install necessary libraries
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder
COPY --from=builder /usr/src/app/target/release/server_rust /usr/local/bin/server_rust

# Expose the application port
EXPOSE 8000

# Run as root (needs Docker socket access to spawn runner containers)
CMD ["server_rust"]
