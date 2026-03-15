from typing import Annotated, List

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from connection_manager.chat_manager import chat_manager
from database import get_db
from dependencies import get_current_user
from schemas.message import MessageResponseSchema, MessageCreateSchema, ConversationResponseSchema, \
    ConversationDetailResponseSchema, ConversationCreateSchema, AddUserInGroupSchema
from schemas.user import UserResponseSchema
from services.message import ChatService

db_dependency = Annotated[Session, Depends(get_db)]

chat_service = ChatService()
chat_router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@chat_router.post("", response_model=MessageResponseSchema, status_code=201)
async def create_message(request: MessageCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    sender_id = str(user_data["id"])

    response, receiver_ids = chat_service.create_message(request, sender_id, db)

    message_dict = jsonable_encoder(response)

    for r_id in receiver_ids:
        await chat_manager.send_personal_message(message_dict, r_id)

    return response


@chat_router.get("/conversations/{receiver_id}", response_model=ConversationResponseSchema, status_code=200)
def get_conversation_data_by_receiver_id(receiver_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    sender_id = user_data["id"]
    return chat_service.get_conversation_data_by_receiver_id(db, sender_id, receiver_id)


@chat_router.get("/conversations", response_model=List[ConversationResponseSchema], status_code=200)
def get_conversations_by_user_id(db: db_dependency, user_data=Depends(get_current_user)):
    response = chat_service.get_conversations_by_user_id(db, user_data["id"])
    return response


@chat_router.get("/messages/by-conversation/{conversation_id}", response_model=ConversationDetailResponseSchema,
                 status_code=200)
def get_messages_by_conversation_id(db: db_dependency, conversation_id, user_data=Depends(get_current_user)):
    response = chat_service.get_messages_by_conversation_id(db, conversation_id)
    return response


@chat_router.post("/group", response_model=ConversationResponseSchema, status_code=201)
def create_group_conversation(request: ConversationCreateSchema, db: db_dependency,
                              user_data=Depends(get_current_user)):
    response = chat_service.create_group_conversation(request, user_data['id'], db)
    return response


@chat_router.put("/group/add_user", response_model=ConversationResponseSchema, status_code=200)
def add_user_in_group_conversation(request: AddUserInGroupSchema, db: db_dependency,
                                   user_data=Depends(get_current_user)):
    response = chat_service.add_user_in_group_conversation(request, db)
    return response

@chat_router.get("/group/users/", response_model=List[UserResponseSchema], status_code=200)
def get_users_from_group(conversation_id: str, db: db_dependency,
                                   user_data=Depends(get_current_user)):
    response = chat_service.get_users_from_group(conversation_id, db)
    return response


@chat_router.get("/group/search/", response_model=List[UserResponseSchema], status_code=200)
def get_users_not_in_group(query: str, conversation_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return chat_service.get_users_not_in_group(db, query, conversation_id)
