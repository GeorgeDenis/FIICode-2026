from typing import Dict
from uuid import UUID

from fastapi import WebSocket


class CrisisConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str | UUID):
        await websocket.accept()
        self.active_connections[str(user_id)] = websocket

    def disconnect(self, user_id: str | UUID):
        user_id_str = str(user_id)
        if user_id_str in self.active_connections:
            del self.active_connections[user_id_str]

    async def send_to_user(self, message: dict, user_id: str | UUID):
        websocket = self.active_connections.get(str(user_id))
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception:
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        """Broadcast to all connected crisis WS clients."""
        disconnected = []
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(user_id)
        for uid in disconnected:
            self.disconnect(uid)

    async def broadcast_to_users(self, message: dict, user_ids: list[str]):
        """Broadcast to specific users only (for local crises)."""
        for user_id in user_ids:
            await self.send_to_user(message, user_id)


crisis_manager = CrisisConnectionManager()
