from sqlalchemy.orm import Session

from models.message import Message, ConversationMember, Conversation
from schemas.message import MessageCreateSchema


class ChatRepository:
    def create_message(self, request: MessageCreateSchema, db: Session):
        new_message = Message(
            author_id=request.receiver_id,
            text=request.text,
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message

    def create_conversation(self, conversation: Conversation, db: Session):
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    def get_conversation(self, db: Session, sender_id: str, receiver_id: str):
        sender_conversations = db.query(ConversationMember.conversation_id).filter(
            ConversationMember.user_id == sender_id
        ).subquery()

        receiver_conversations = db.query(ConversationMember.conversation_id).filter(
            ConversationMember.user_id == receiver_id
        ).subquery()

        conversation = db.query(Conversation).filter(
            Conversation.id.in_(sender_conversations),
            Conversation.id.in_(receiver_conversations),
            Conversation.is_group == False
        ).first()

        return conversation

    def get_conversation_by_user_id(self, db: Session, user_id: str):
        conversations = db.query(Conversation).join(ConversationMember).filter(
            ConversationMember.user_id == user_id
        ).all()

        return conversations

    def get_messages_by_conversation_id(self, db: Session, conversation_id: str):
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            return {"messages": [], "members": []}

        members_list = [member.user for member in conversation.members]
        messages_list = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(
            Message.created_at.asc()).all()

        return {
            "messages": messages_list,
            "members": members_list
        }
