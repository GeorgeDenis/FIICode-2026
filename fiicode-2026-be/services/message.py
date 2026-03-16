from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.message import Conversation, ConversationMember, Message
from repositories.message import ChatRepository
from schemas.message import MessageCreateSchema, MessageResponseSchema, ConversationCreateSchema, AddUserInGroupSchema
from services.user import UserService

chat_repository = ChatRepository()
user_service = UserService()


class ChatService:
    def create_message(self, request: MessageCreateSchema, sender_id: str, db: Session):
        if request.conversation_id:
            conversation = chat_repository.get_conversation_by_id(db, request.conversation_id)
        else:
            conversation = chat_repository.get_conversation_data_by_receiver_id(db, sender_id, request.receiver_id)

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

        members = db.query(ConversationMember.user_id).filter(
            ConversationMember.conversation_id == conversation.id,
        ).all()

        receiver_ids = [str(member.user_id) for member in members]

        response = MessageResponseSchema(
            id=new_message.id,
            text=new_message.text,
            author_id=new_message.author_id,
            conversation_id=new_message.conversation_id,
            created_at=new_message.created_at,
            updated_at=new_message.updated_at
        )

        return response, receiver_ids

    def get_conversations_by_user_id(self, db: Session, user_id: str):
        conversations = chat_repository.get_conversation_by_user_id(db, user_id)
        return conversations

    def get_conversation_data_by_receiver_id(self, db: Session, sender_id: str, receiver_id: str):
        conversation = chat_repository.get_conversation_data_by_receiver_id(db, sender_id, receiver_id)

        if not conversation:
            raise AppException("Conversation not found", 404)

        return conversation

    def get_messages_by_conversation_id(self, db: Session, conversation_id: str):
        messages = chat_repository.get_messages_by_conversation_id(db, conversation_id)
        return messages

    def create_group_conversation(self, request: ConversationCreateSchema, sender_id: str, db: Session):
        return chat_repository.create_group_conversation(request, sender_id, db)

    def add_user_in_group_conversation(self, request: AddUserInGroupSchema, db: Session):
        return chat_repository.add_user_in_group_conversation(request, db)

    def get_users_not_in_group(self, db: Session, query: str, conversation_id: str):
        conversation = chat_repository.get_conversation_by_id(db, conversation_id)
        if not conversation:
            raise AppException("Conversation not found", 404)

        member_ids = [str(member.user_id) for member in conversation.members]

        users = user_service.get_users_by_query_by_name(query, db)
        users_not_in_group = [user for user in users if str(user.id) not in member_ids]

        return users_not_in_group

    def get_users_from_group(self, conversation_id: str, db: Session):
        conversation = chat_repository.get_conversation_by_id(db, conversation_id)
        if not conversation:
            raise AppException("Conversation not found", 404)

        member_ids = [str(member.user_id) for member in conversation.members]

        users = user_service.get_users_by_ids(member_ids, db)

        return users
