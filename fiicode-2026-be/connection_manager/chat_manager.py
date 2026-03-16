from typing import Dict
from uuid import UUID

from fastapi import WebSocket


class ChatConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str | UUID):
        await websocket.accept()
        self.active_connections[str(user_id)] = websocket

    def disconnect(self, user_id: str | UUID):
        user_id_str = str(user_id)
        if user_id_str in self.active_connections:
            del self.active_connections[user_id_str]

    async def send_personal_message(self, message: dict, receiver_id: str | UUID):
        websocket = self.active_connections.get(str(receiver_id))

        if websocket:
            try:
                await websocket.send_json(message)
            except Exception as e:
                self.disconnect(receiver_id)

chat_manager = ChatConnectionManager()

