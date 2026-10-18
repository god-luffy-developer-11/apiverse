import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket
from core.redis_client import pubsub_broker

class RealtimeConnectionManager:
    def __init__(self):
        # workspace_id -> set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # workspace_id -> user_id -> presence dict
        self.presence_cache: Dict[str, Dict[str, dict]] = {}

    async def connect(self, websocket: WebSocket, workspace_id: str, user_id: str, user_meta: dict):
        await websocket.accept()
        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = set()
            self.presence_cache[workspace_id] = {}
        
        self.active_connections[workspace_id].add(websocket)
        self.presence_cache[workspace_id][user_id] = user_meta

        # Broadcast joined presence
        await self.broadcast_workspace(workspace_id, {
            "type": "PRESENCE_UPDATE",
            "workspaceId": workspace_id,
            "senderId": user_id,
            "timestamp": "now",
            "payload": {
                "activeAstronauts": list(self.presence_cache[workspace_id].values())
            }
        })

    def disconnect(self, websocket: WebSocket, workspace_id: str, user_id: str):
        if workspace_id in self.active_connections:
            self.active_connections[workspace_id].discard(websocket)
            if not self.active_connections[workspace_id]:
                del self.active_connections[workspace_id]
        
        if workspace_id in self.presence_cache and user_id in self.presence_cache[workspace_id]:
            del self.presence_cache[workspace_id][user_id]

    async def broadcast_workspace(self, workspace_id: str, message: dict):
        # Also fan-out through Redis pubsub broker
        await pubsub_broker.publish(f"workspace:{workspace_id}", message)
        
        if workspace_id in self.active_connections:
            text = json.dumps(message)
            stale = []
            for ws in self.active_connections[workspace_id]:
                try:
                    await ws.send_text(text)
                except Exception:
                    stale.append(ws)
            for s in stale:
                self.active_connections[workspace_id].discard(s)

realtime_manager = RealtimeConnectionManager()
