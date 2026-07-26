from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")


@router.get("")
async def health_check() -> dict[str, str]:
    return {
        "status": "online",
        "service": "python",
    }
