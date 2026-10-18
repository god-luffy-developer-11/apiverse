import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from realtime.gateway import realtime_manager

# Import routers
from routers import (
    auth, explorer, vault, playground, analytics, alerts,
    ultron, recommender, starter_kit, setup_assistant,
    free_tier, docs, community, learning, webhooks, billing
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="APIVerse - The Developer Operating System for Working with APIs"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount all routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(explorer.router, prefix="/api/v1")
app.include_router(vault.router, prefix="/api/v1")
app.include_router(playground.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(ultron.router, prefix="/api/v1")
app.include_router(recommender.router, prefix="/api/v1")
app.include_router(starter_kit.router, prefix="/api/v1")
app.include_router(setup_assistant.router, prefix="/api/v1")
app.include_router(free_tier.router, prefix="/api/v1")
app.include_router(docs.router, prefix="/api/v1")
app.include_router(community.router, prefix="/api/v1")
app.include_router(learning.router, prefix="/api/v1")
app.include_router(webhooks.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "APIVerse Backend Engine",
        "environment": settings.ENVIRONMENT,
        "vaultEncryption": "AES-256-GCM Hardware-Ready",
        "realtime": "WebSocket + SSE Active"
    }

# Real-time WebSocket Gateway
@app.websocket("/ws/{workspace_id}")
async def websocket_realtime_endpoint(websocket: WebSocket, workspace_id: str, user_id: str = "astro_guest"):
    await realtime_manager.connect(websocket, workspace_id, user_id, {
        "userId": user_id,
        "name": "Astronaut Engineer",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        "currentOrbit": "Galaxy Dashboard"
    })
    try:
        while True:
            data = await websocket.receive_json()
            # Handle inbound events (e.g. cursor motion, typing indicator, team edits)
            event_type = data.get("type", "UNKNOWN")
            if event_type == "CURSOR_MOVE":
                await realtime_manager.broadcast_workspace(workspace_id, {
                    "type": "CURSOR_MOVE",
                    "workspaceId": workspace_id,
                    "senderId": user_id,
                    "payload": data.get("payload", {})
                })
            elif event_type == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        realtime_manager.disconnect(websocket, workspace_id, user_id)
    except Exception:
        realtime_manager.disconnect(websocket, workspace_id, user_id)
