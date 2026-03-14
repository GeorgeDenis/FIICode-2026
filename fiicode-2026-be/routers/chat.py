from typing import Annotated, List

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from connection_manager.chat_manager import chat_manager
from database import get_db
from dependencies import get_current_user
from schemas.message import MessageResponseSchema, MessageCreateSchema, ConversationResponseSchema, \
    ConversationDetailResponseSchema
from services.message import ChatService

db_dependency = Annotated[Session, Depends(get_db)]

chat_service = ChatService()
chat_router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@chat_router.post("", response_model=MessageResponseSchema, status_code=201)
async def create_message(request: MessageCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    sender_id = user_data["id"]
    response = chat_service.create_message(request, sender_id, db)
    message_dict = jsonable_encoder(response)
    await chat_manager.send_personal_message(message_dict, request.receiver_id)
    return response


@chat_router.get("/conversations", response_model=List[ConversationResponseSchema], status_code=200)
def get_conversations_by_user_id(db: db_dependency, user_data=Depends(get_current_user)):
    response = chat_service.get_conversations_by_user_id(db, user_data["id"])
    return response

@chat_router.get("/messages/by-conversation/{conversation_id}", response_model=ConversationDetailResponseSchema, status_code=200)
def get_messages_by_conversation_id(db: db_dependency, conversation_id, user_data=Depends(get_current_user)):
    response = chat_service.get_messages_by_conversation_id(db, conversation_id)
    return response



