import uuid

from sqlalchemy import Column, ForeignKey, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(UUID, ForeignKey("users.id"), index=True)
    actor_id = Column(UUID, ForeignKey("users.id"), nullable=True)

    type = Column(String)

    content = Column(String)
    entity_id = Column(UUID, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_notifications")
    actor = relationship("User", foreign_keys=[actor_id], back_populates="triggered_notifications")
