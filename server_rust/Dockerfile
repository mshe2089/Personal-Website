# Use the official Rust image as a builder
FROM rust:1.75-slim as builder

WORKDIR /usr/src/app
COPY . .

# Build the application
RUN cargo build --release

# Final runtime image
FROM rust:1.75-slim

WORKDIR /app

# Install necessary libraries if needed
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder
COPY --from=builder /usr/src/app/target/release/server_rust /usr/local/bin/server_rust

# Expose the application port
EXPOSE 8000

# Set the entrypoint
CMD ["server_rust"]
