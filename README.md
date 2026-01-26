# The Daniel Lab (Server Edition)

This is a high-performance, minimalist Technical Journal designed to showcase experiments in Machine Learning, Graphics (WGPU), Game Development, and Security.

## Architecture

The Lab follows an **Efficient Minimalist** architecture optimized for the **Server** (Dell Inspiron 7590). It is structured as an outbound-ready "Zero-Fiddle" deployment using Docker and Cloudflare Tunnels.

### Gateway & Delivery

*   **API Gateway (NGINX)**: The authoritative sentry. It handles SSL termination, static file delivery, and reverse-proxying through a **Unified Gateway** model (`infra/common_routes.conf`).
*   **Frontend (React/Vite)**: A high-performance, containerized UI that consumes a centralized **Routing Registry** (`src/registry/registry.js`).
*   **Logic (Python/Flask)**: The computational core handling technical tasks like SAT solving.

### Portability Layers

1.  **Cloudflare Tunnel**: Outbound-only connectivity to `muqing.dev` without port forwarding.
2.  **Infrastructure Isolation**: All delivery pipeline assets are separated into `infra/` directories within their respective service nodes.

## Quick Start

1.  **Configure Environment**:
    ```bash
    cp .env.example .env
    # Add your CLOUDFLARE_TUNNEL_TOKEN to .env
    ```
2.  **Launch**:
    ```bash
    docker compose up --build -d
    ```

## Documentation

- [Phase Roadmap](./task.md)
- [Implementation Plan](./implementation_plan.md)
- [Deployment Walkthrough](./walkthrough.md)

---
*Architectural integrity maintained by Anti*
