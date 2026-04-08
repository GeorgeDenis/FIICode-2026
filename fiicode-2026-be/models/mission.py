import enum
import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, func, Boolean, Enum
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class StatusType(enum.Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    COMPLETED = "Completed"
    DECLINED = "Declined"


class FeedbackType(enum.Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"


class Mission(Base):
    __tablename__ = 'missions'

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)

    pulse_id = Column(UUID(as_uuid=True), ForeignKey('pulses.id'), index=True, nullable=False)

    hero_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True, nullable=False)

    status = Column(Enum(StatusType), default=StatusType.PENDING)

    feedback_type = Column(Enum(FeedbackType), nullable=True)
    feedback_text = Column(String, nullable=True)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    pulse = relationship("Pulse", back_populates="missions")
    hero = relationship("User", back_populates="missions")
