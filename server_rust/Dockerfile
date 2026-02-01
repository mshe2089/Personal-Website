# Use the official Rust image as a builder
FROM rust:1.75-slim AS builder

WORKDIR /usr/src/app
COPY . .

# Build the application
RUN cargo build --release

# Final runtime image
FROM rust:1.75-slim

WORKDIR /app

# Install necessary libraries if needed
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Create unprivileged user for running user code
RUN useradd -m -u 1000 -s /bin/bash rustuser

# Copy the binary from the builder
COPY --from=builder /usr/src/app/target/release/server_rust /usr/local/bin/server_rust

# Create /tmp directory with proper permissions (will be mounted as tmpfs)
RUN mkdir -p /tmp && chmod 1777 /tmp

# Expose the application port
EXPOSE 8000

# Run as root (web server needs SETUID/SETGID to drop privileges for user code)
# The server will spawn user processes as rustuser (UID 1000)
CMD ["server_rust"]
