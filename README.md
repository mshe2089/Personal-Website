# muqing.dev

Personal website and small interactive tools.

The current site contains:

- A React landing page
- A Redis-backed collaborative signature canvas
- A Boolean SAT solver

## Run

Requirements:

- Docker Engine with the Compose plugin
- A Cloudflare Tunnel token in `.env` for public ingress
- Optional TLS files at `SSL_CERT_PATH`

```bash
cp .env.example .env
docker compose up --build -d
```

Only NGINX publishes host ports. FastAPI, Rust, and Redis remain internal to
the Compose network.

## Validate

```bash
cd server_rust
cargo fmt --check
cargo check --locked
cargo clippy --all-targets --locked -- -D warnings

cd ../frontend_react
yarn install --frozen-lockfile
yarn build

cd ..
python3 -m compileall -q server_fastapi
docker compose --env-file .env.example config --quiet
```

See [TECHNICAL.md](./TECHNICAL.md) for the current architecture, interfaces,
constraints, and known limitations.
