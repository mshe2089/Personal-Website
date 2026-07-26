import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import health, sat


def create_app() -> FastAPI:
    application = FastAPI(
        title="Daniel Lab API",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    allowed_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    ]
    application.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(sat.router)
    return application


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
