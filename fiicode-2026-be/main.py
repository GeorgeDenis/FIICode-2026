from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from starlette.middleware.cors import CORSMiddleware

import models.message as message_model
import models.pulse as pulse_model
import models.user as user_model
import models.notification as notification_model
from connection_manager.chat_manager import chat_manager
from connection_manager.feed_manager import feed_manager
from database import engine
from exceptions.handlers import register_exception_handlers
from routers.auth import auth_router
from routers.chat import chat_router
from routers.notification import notification_router
from routers.pulse import pulse_router
from routers.user import user_router

app = FastAPI()

origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "exp://192.168.x.x:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pulse_router)
app.include_router(chat_router)
app.include_router(user_router)
app.include_router(notification_router)

register_exception_handlers(app)
user_model.Base.metadata.create_all(bind=engine)
pulse_model.Base.metadata.create_all(bind=engine)
message_model.Base.metadata.create_all(bind=engine)
notification_model.Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.websocket("/ws/{client_id}")
async def websocket_feed(websocket: WebSocket):
    await feed_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        await feed_manager.disconnect(websocket)


@app.websocket("/ws/chat/{client_id}")
async def chat_feed(websocket: WebSocket, client_id: str):
    await chat_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        chat_manager.disconnect(websocket)
