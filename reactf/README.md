# Service: API (Gateway)

**Directory**: `/reactf`  
**Container Name**: `personal-website-api-1`

## Responsibility

The **API** service acts as the primary gatekeeper and facade for the Daniel Lab. It is the only service exposed through the Cloudflare Tunnel.

- **Static Hosting**: Serves the high-performance React (Vite) frontend.
- **Reverse Proxy**: Routes all `/api/*` traffic to backend services through a **Unified Gateway** model.
- **Self-Healing Routing**: Dynamically detects SSL certificates and negotiates between HTTP and HTTPS modes on start-up.
- **Unified Logic**: Utilizes `infra/common_routes.conf` to ensure identical routing rules across all protocols.

## Architecture

- **Engine**: NGINX (Stable Alpine)
- **Build Tool**: Vite (Replaced Webpack/react-scripts)
- **Routing**: Centralized `registry.js` (Frontend) and `common_routes.conf` (Gateway).
- **Isolation**: Delivery configuration is isolated in the `infra/` directory.

## Setup & Configuration

This service is configured via:
- `infra/nginx_http.conf`: HTTP entry point.
- `infra/nginx_https.conf`: HTTPS entry point (SSL termination).
- `infra/common_routes.conf`: Shared routing logic.
- `infra/dockerfile.reactf`: Multi-stage Docker build.

---
*Documented by Anti*