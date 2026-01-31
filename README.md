# Introduction

Personal website for fun.

## Architecture

Containerized stack unified under an NGINX gateway.

*   **Gateway**: NGINX handling SSL termination and proxying to `/api/v1/` services.
*   **Frontend**: React (Vite) application with a centralized routing registry.
*   **Systems Node**: Rust (Axum/Tokio) for code execution and interactive terminal streams via WebSockets.
*   **Logic Node**: Python (FastAPI) for stateless utilities and SAT solving.
*   **State**: Redis for cross-service orchestration.
*   **Connectivity**: Cloudflare Tunnel for outbound-only ingress to muqing.dev.

## Setup

```bash
cp .env.example .env
docker compose up --build -d
```

## Documentation

- [Project Roadmap](./task.md)
- [System Walkthrough](./walkthrough.md)

