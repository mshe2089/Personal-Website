# Service: CORE (Logic)

**Directory**: `/flaskr`  
**Container Name**: `personal-website-core-1`

## Responsibility

The **CORE** service is the computational hub of the Lab. It handles all stateful logic and heavy mathematical processing.

- **SAT Solver**: Provides a specialized API for truth table generation and logical verification.
- **REST API**: Serves JSON responses to the **API** gateway.
- **Production Serving**: Uses `waitress-serve` to ensure stable, multi-threaded performance.

## Architecture

- **Backend**: Flask (Python 3.9)
- **Server**: Waitress (Production WSGI)
- **Networking**: Listens internally on port `5000`. Does NOT expose ports to the host directly.

## Setup & Configuration

- **Dependencies**: Defined in `requirements.txt`.
- **Environment**: Managed through `config.py` (Production vs. Development modes).
- **Docker**: `dockerfile.flaskr` handles the Python environment and pip installation.

---
*Documented by Anti*
