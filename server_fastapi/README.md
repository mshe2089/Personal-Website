# FastAPI logic service

This internal service provides the SAT solver and a health endpoint.

- `app.py`: application factory and middleware
- `routes/health.py`: health route
- `routes/sat.py`: bounded SAT API
- `scripts/sat.py`: Boolean parser and truth-table generator

The service listens on port `5000` inside the Compose network. NGINX exposes
it under `/api/v1/python`.
