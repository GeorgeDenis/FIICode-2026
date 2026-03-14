from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.message import Conversation, ConversationMember, Message
from repositories.message import ChatRepository
from schemas.message import MessageCreateSchema
from services.user import UserService

chat_repository = ChatRepository()
user_service = UserService()


class ChatService:
    def create_message(self, request: MessageCreateSchema, sender_id: str, db: Session):
        conversation = chat_repository.get_conversation(db, sender_id, request.receiver_id)

        if not conversation:
            conversation = Conversation(is_group=False, name=None)
            db.add(conversation)
            db.flush()

            db.add(ConversationMember(conversation_id=conversation.id, user_id=sender_id))
            db.add(ConversationMember(conversation_id=conversation.id, user_id=request.receiver_id))
            db.flush()

        new_message = Message(
            text=request.text,
            author_id=sender_id,
            conversation_id=conversation.id
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)

        return new_message

    def get_conversations_by_user_id(self, db: Session, user_id: str):
        conversations = chat_repository.get_conversation_by_user_id(db, user_id)
        return conversations

    def get_messages_by_conversation_id(self, db: Session, conversation_id: str):
        messages = chat_repository.get_messages_by_conversation_id(db, conversation_id)
        return messages
