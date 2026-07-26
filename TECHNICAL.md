# Technical state

This document describes the repository after the July 2026 scope reduction.
The deployed product is a personal website with two interactive features: a
shared pixel canvas and a Boolean SAT solver.

AI inference, GPU monitoring, Ollama integration, the Rust playground,
Post-Scarcity article, and asynchronous transport demo are not part of the
current application.

## System architecture

| Component | Technology | Responsibility |
| --- | --- | --- |
| Gateway and static site | NGINX | Serves the React build, terminates optional TLS, rate-limits APIs, and proxies backend traffic |
| Frontend | React 18, Vite, Tailwind CSS | Landing page, navigation, signature canvas, and SAT solver UI |
| Logic service | Python 3.12, FastAPI | SAT validation and truth-table generation |
| Canvas service | Rust, Axum, Tokio | Canvas HTTP API and real-time WebSocket synchronization |
| State | Redis | Persists canvas metadata and RGB buffers |
| Public ingress | Cloudflare Tunnel | Routes `muqing.dev` to NGINX without exposing backend services |

Request flow:

```text
Browser
  |
  v
Cloudflare Tunnel --> NGINX --> React static files
                         |----> /api/v1/python/* --> FastAPI
                         `----> /api/v1/rust/*   --> Axum --> Redis
```

NGINX is the only service with published host ports. FastAPI, Axum, and Redis
are reachable only through the default Compose network.

## Frontend

The frontend entry point is `frontend_react/src/index.jsx`. It mounts the
router, navigation, application routes, and footer.

Routes are declared in `frontend_react/src/config/routes.js`. The navigation
is generated from the same registry, so a new visible route requires one
registry entry rather than separate router and menu edits.

Current browser routes:

| Path | Purpose |
| --- | --- |
| `/` | Landing page and shared signature canvas |
| `/tools/SATSolver` | Boolean SAT solver |
| `*` | Local not-found page |

Feature boundaries:

- `Pages/` contains route-level views.
- `Components/` contains reusable presentation components.
- `hooks/` owns feature state and browser lifecycle.
- `api/` owns HTTP and WebSocket transport details.
- `config/routes.js` is the source of truth for routing and navigation.

The canvas keeps an optimistic RGB buffer in the browser. Drawing events are
sent over a WebSocket and applied locally immediately. The server persists
updates in Redis and broadcasts them to connected clients. Undo history is
local to each browser session.

## FastAPI service

`server_fastapi/app.py` is an application factory and middleware assembly
point. Route handlers are split by feature under `server_fastapi/routes/`.

Public routes after NGINX rewriting:

| External route | Internal FastAPI route | Method |
| --- | --- | --- |
| `/api/v1/python` | `/api/v1` | GET |
| `/api/v1/python/SATsolver_script` | `/api/v1/SATsolver_script` | GET |

The SAT formula is sent in the `formula` header for compatibility with the
existing UI. Input is limited to 128 characters and 12 unique variables.
Computation runs in a worker thread so exponential truth-table generation does
not block FastAPI's event loop.

The solver in `server_fastapi/scripts/sat.py` supports single-character
variables and the operators `¬`, `∧`, `∨`, `→`, and `↔`.

## Rust canvas service

`server_rust/src/main.rs` assembles the HTTP router and shared state.
`server_rust/src/canvas.rs` owns all canvas behavior.

Routes:

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/v1/rust/ping` | GET | Service health |
| `/api/v1/rust/canvas/:name/init` | POST | Create a canvas if absent |
| `/api/v1/rust/canvas/:name/info` | GET | Return dimensions |
| `/api/v1/rust/canvas/:name/data` | GET | Return packed RGB bytes |
| `/api/v1/rust/canvas/:name/pixel` | POST | Update one pixel |
| `/api/v1/rust/canvas/:name/ws` | WebSocket | Send and receive live updates |

Canvas names are restricted to ASCII letters, digits, hyphens, and
underscores. Dimensions are capped at 512 by 512 pixels. Batch updates are
capped at 2,048 pixels and brush size at 32 pixels. Request bodies are capped
at 64 KiB.

Redis stores two keys per canvas:

- `canvas_meta:<name>` contains JSON dimensions.
- `canvas_data:<name>` contains packed three-byte RGB pixels.

Both keys receive the configured `CANVAS_TTL_SECONDS` expiry. Axum broadcast
channels are process-local and exist only while clients are connected.

## Deployment

`docker-compose.yml` defines:

- `api`: React build served by NGINX
- `core`: FastAPI SAT service
- `rust`: Axum canvas service
- `redis`: persistent canvas state
- `tunnel`: Cloudflare ingress

The frontend entrypoint selects HTTP or HTTPS NGINX configuration at startup.
If `/etc/nginx/ssl/cert.pem` and `/etc/nginx/ssl/key.pem` are both present,
NGINX enables HTTPS and redirects HTTP traffic. Otherwise, it serves HTTP.

Configuration:

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT_HTTP` | Published HTTP port | `80` |
| `PORT_HTTPS` | Published HTTPS port | `443` |
| `SSL_CERT_PATH` | Host certificate directory | `./certs` |
| `CLOUDFLARE_TUNNEL_TOKEN` | Cloudflare connector credential | none |
| `CANVAS_TTL_SECONDS` | Redis canvas retention | `86400` |

## Security and operational constraints

- NGINX applies per-IP request limits and WebSocket connection limits.
- Backend request bodies and feature-specific inputs are bounded.
- Backend services do not publish host ports.
- Redis has persistent storage and a health check.
- CORS is same-origin by default. Extra origins must be supplied through
  `CORS_ALLOWED_ORIGINS` to the FastAPI container if needed.
- The canvas is intentionally public and unauthenticated. Anyone who can
  access the site can draw.

## Known limitations

- There is no automated test suite yet; build, lint, and configuration checks
  are the current quality gate.
- WebSocket fan-out is process-local, so the Rust service is designed for one
  replica. Multiple replicas would require Redis Pub/Sub or another shared
  event bus.
- The SAT solver is an educational brute-force implementation, not an
  industrial SAT engine.
- Canvas updates are not associated with user identities and have no
  moderation or audit log.
- Cloudflare and certificate lifecycle management are external operational
  responsibilities.

## Extension points

- Add frontend pages through the route registry and a page component.
- Add frontend transports under `src/api/` and stateful behavior under
  `src/hooks/`.
- Add FastAPI features as new modules under `server_fastapi/routes/`.
- Add Rust service domains as modules beside `canvas.rs`, then mount their
  routes in `main.rs`.
- Introduce Redis Pub/Sub before scaling the Rust service horizontally.
