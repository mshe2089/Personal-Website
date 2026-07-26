import asyncio
import base64
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/v1/palworld", tags=["palworld"])

API_URL = os.getenv(
    "PALWORLD_API_URL",
    "http://host.docker.internal:8212/v1/api",
).rstrip("/")
API_USERNAME = os.getenv("PALWORLD_API_USERNAME", "admin")
PASSWORD_FILE = os.getenv(
    "PALWORLD_ADMIN_PASSWORD_FILE",
    "/run/secrets/palworld_admin_password",
)
PUBLIC_HOSTNAME = os.getenv("PALWORLD_PUBLIC_HOSTNAME", "pal.muqing.dev")
POLL_INTERVAL_SECONDS = 5
REQUEST_TIMEOUT_SECONDS = 3
HOST_PROC = Path("/host/proc")


def read_admin_password() -> str:
    return Path(PASSWORD_FILE).read_text(encoding="utf-8").strip()


def fetch_json(path: str, authorization: str) -> dict:
    request = Request(
        f"{API_URL}/{path}",
        headers={
            "Accept": "application/json",
            "Authorization": authorization,
        },
    )
    with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        return json.load(response)


def find_palworld_pid() -> str | None:
    if not HOST_PROC.is_dir():
        return None

    for entry in HOST_PROC.iterdir():
        if not entry.name.isdigit():
            continue
        try:
            command = (entry / "cmdline").read_bytes().replace(b"\0", b" ")
        except OSError:
            continue
        if b"PalServer-Linux-Shipping" in command:
            return entry.name
    return None


def read_cpu_sample(pid: str) -> tuple[int, int, int]:
    total = sum(
        int(value)
        for value in (HOST_PROC / "stat").read_text().splitlines()[0].split()[1:]
    )
    cpu_count = sum(
        line.startswith("cpu") and line[3:4].isdigit()
        for line in (HOST_PROC / "stat").read_text().splitlines()
    )
    process_stat = (HOST_PROC / pid / "stat").read_text()
    fields = process_stat[process_stat.rfind(")") + 2:].split()
    process = int(fields[11]) + int(fields[12])
    return total, process, cpu_count


def collect_resources() -> dict | None:
    pid = find_palworld_pid()
    if pid is None:
        return None

    try:
        total_before, process_before, cpu_count = read_cpu_sample(pid)
        time.sleep(0.1)
        total_after, process_after, _ = read_cpu_sample(pid)
        cpu_percent = (
            (process_after - process_before)
            / max(total_after - total_before, 1)
            * cpu_count
            * 100
        )
        status = (HOST_PROC / pid / "status").read_text().splitlines()
        rss_kib = next(
            int(line.split()[1]) for line in status if line.startswith("VmRSS:")
        )
        return {
            "cpu_percent": round(cpu_percent, 1),
            "memory_bytes": rss_kib * 1024,
        }
    except (OSError, StopIteration, ValueError):
        return None


def collect_snapshot() -> dict:
    checked_at = datetime.now(timezone.utc).isoformat()

    try:
        credentials = base64.b64encode(
            f"{API_USERNAME}:{read_admin_password()}".encode()
        ).decode()
        authorization = f"Basic {credentials}"
        info = fetch_json("info", authorization)
        metrics = fetch_json("metrics", authorization)
        resources = collect_resources()

        return {
            "online": True,
            "checked_at": checked_at,
            "hostname": PUBLIC_HOSTNAME,
            "info": {
                "name": info.get("servername"),
                "description": info.get("description"),
                "version": info.get("version"),
            },
            "metrics": {
                "server_fps": metrics.get("serverfps"),
                "frame_time_ms": metrics.get("serverframetime"),
                "players": metrics.get("currentplayernum"),
                "max_players": metrics.get("maxplayernum"),
                "uptime_seconds": metrics.get("uptime"),
                "base_count": metrics.get("basecampnum"),
                "days": metrics.get("days"),
            },
            "resources": resources,
        }
    except (HTTPError, URLError, TimeoutError, OSError, ValueError):
        return {
            "online": False,
            "checked_at": checked_at,
            "hostname": PUBLIC_HOSTNAME,
            "info": None,
            "metrics": None,
            "resources": None,
        }


async def snapshot() -> dict:
    return await asyncio.to_thread(collect_snapshot)


@router.get("/status")
async def get_status() -> dict:
    return await snapshot()


@router.get("/events")
async def stream_status() -> StreamingResponse:
    async def event_stream():
        while True:
            payload = await snapshot()
            yield f"data: {json.dumps(payload, separators=(',', ':'))}\n\n"
            await asyncio.sleep(POLL_INTERVAL_SECONDS)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
