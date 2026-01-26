from fastapi import FastAPI, Header, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
import json
import uuid
from urllib.parse import unquote

from scripts.sat import SATsolve

app = FastAPI(
    title="Daniel Lab API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Shared state for Background Tasks Demo
tasks_status = {}

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/SATsolver_script")
async def sat_solver_script(formula: str = Header(...)):
    """
    SAT solver endpoint that takes a 'formula' from headers.
    """
    print(f"Request: /api/SATsolver_script with formula: {formula}")
    decoded_formula = unquote(formula)
    result = SATsolve(decoded_formula)
    return {"result": result}

@app.get("/api/stream_progress")
async def stream_progress():
    """
    SSE endpoint that streams progress of a dummy heavy task.
    """
    async def event_generator():
        for i in range(0, 101, 5):
            await asyncio.sleep(0.5)
            status = "Initializing..." if i == 0 else "Processing heavy data..." if i < 100 else "Task Complete!"
            yield f"data: {json.dumps({'progress': i, 'status': status})}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.websocket("/ws/progress")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        for i in range(0, 101, 10):
            await asyncio.sleep(0.3)
            status = "WS: Calculating..." if i < 100 else "WS: Done!"
            await websocket.send_text(json.dumps({"progress": i, "status": status}))
        await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("WebSocket client disconnected")

async def carry_out_heavy_task(task_id: str):
    tasks_status[task_id] = {"progress": 0, "status": "Task Started"}
    for i in range(0, 101, 20):
        await asyncio.sleep(1)
        tasks_status[task_id] = {"progress": i, "status": f"Method: Polling | Progress: {i}%"}
    tasks_status[task_id]["status"] = "Task 100% Complete!"

@app.post("/api/task/start")
async def start_background_task(background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    background_tasks.add_task(carry_out_heavy_task, task_id)
    return {"task_id": task_id}

@app.get("/api/task/status/{task_id}")
async def get_task_status(task_id: str):
    return tasks_status.get(task_id, {"progress": 0, "status": "Task Not Found"})

@app.get("/api")
async def ping():
    """
    Health check endpoint.
    """
    return {"status": "online", "message": "Daniel Lab API is running on the Server using FastAPI!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
