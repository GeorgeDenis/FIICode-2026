import enum
import uuid

from sqlalchemy import Column, String, DateTime, Float, Enum, ForeignKey, func, Boolean
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class PulseType(enum.Enum):
    EMERGENCY = "Emergency"
    SKILL = "Skill"
    ITEM = "Item"


class UrgencyLevel(enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class Pulse(Base):
    __tablename__ = 'pulses'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    author_id = Column(UUID, ForeignKey("users.id"))

    type = Column(Enum(PulseType))
    urgency_level = Column(Enum(UrgencyLevel))
    content = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    author = relationship("User", back_populates="pulses")


class PulseComment(Base):
    __tablename__ = 'pulse_comments'
    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    author_id = Column(UUID, ForeignKey("users.id"))
    pulse_id = Column(UUID, ForeignKey("pulses.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    content = Column(String)

    author = relationship("User", back_populates="pulse_comments")

class PulseReaction(Base):
    __tablename__ = "pulse_reactions"

    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    pulse_id = Column(UUID, ForeignKey("pulses.id", ondelete="CASCADE"), primary_key=True)

    is_like = Column(Boolean, nullable=False)