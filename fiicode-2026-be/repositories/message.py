from sqlalchemy.orm import Session, joinedload

from exceptions.exceptions import AppException
from models.message import Message, ConversationMember, Conversation
from schemas.message import MessageCreateSchema, ConversationCreateSchema, AddUserInGroupSchema


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

    def get_message_by_id(self, db: Session, message_id: str):
        message = db.query(Message).filter(Message.id == message_id).first()
        return message

    def get_conversation_by_id(self, db: Session, conversation_id: str):
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        return conversation

    def get_conversation_by_user_id(self, db: Session, user_id: str):
        conversations = db.query(Conversation).join(ConversationMember).filter(
            ConversationMember.user_id == user_id
        ).all()

        return conversations

    def get_conversation_data_by_receiver_id(self, db: Session, sender_id: str, receiver_id: str):
        sender_conversations = db.query(ConversationMember.conversation_id).filter(
            ConversationMember.user_id == sender_id)
        receiver_conversations = db.query(ConversationMember.conversation_id).filter(
            ConversationMember.user_id == receiver_id)

        common_conv_ids = sender_conversations.intersect(receiver_conversations)

        conversation = db.query(Conversation).filter(
            Conversation.id.in_(common_conv_ids),
            Conversation.is_group == False
        ).first()

        return conversation

    def get_messages_by_conversation_id(self, db: Session, conversation_id: str):
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            return {"messages": [], "members": []}

        members_list = [member.user for member in conversation.members]
        messages_list = (db.query(Message).options(joinedload(Message.author))
                         .filter(Message.conversation_id == conversation_id).order_by(
            Message.created_at.asc()).all())


        return {
            "messages": messages_list,
            "members": members_list
        }

    def create_group_conversation(self, request: ConversationCreateSchema, sender_id: str, db: Session):
        new_conversation = Conversation(
            name=request.name,
            is_group=request.is_group,
            is_private=request.is_private,
        )

        db.add(new_conversation)
        db.commit()
        db.refresh(new_conversation)

        db.add(ConversationMember(conversation_id=new_conversation.id, user_id=sender_id))
        db.commit()
        db.flush()
        return new_conversation

    def add_user_in_group_conversation(self, request: AddUserInGroupSchema, db: Session):
        conversation = self.get_conversation_by_id(db, request.conversation_id)
        if not conversation:
            raise AppException("Conversation not found", 404)

        conversation_member = ConversationMember(
            conversation_id=conversation.id,
            user_id=request.user_id
        )
        db.add(conversation_member)
        db.commit()
        db.refresh(conversation_member)

        return conversation

    def save_message(self, message: Message, db: Session):
        db.add(message)
        db.commit()
        db.refresh(message)
        return message