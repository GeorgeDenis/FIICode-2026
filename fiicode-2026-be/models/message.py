import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, func, Boolean
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class Message(Base):
    __tablename__ = 'messages'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    text = Column(String)

    author_id = Column(UUID, ForeignKey("users.id"))
    conversation_id = Column(UUID, ForeignKey("conversations.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    author = relationship("User", back_populates="messages")
    conversation = relationship("Conversation", back_populates="messages")


class Conversation(Base):
    __tablename__ = 'conversations'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    is_group = Column(Boolean, default=False)
    name = Column(String, nullable=True)

    is_private = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    members = relationship("ConversationMember", back_populates="conversation", cascade="all, delete-orphan")


class ConversationMember(Base):
    __tablename__ = 'conversation_members'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    conversation_id = Column(UUID, ForeignKey("conversations.id"))
    user_id = Column(UUID, ForeignKey("users.id"))

    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="members")
    user = relationship("User")
