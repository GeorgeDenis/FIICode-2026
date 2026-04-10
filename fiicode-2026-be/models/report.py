import enum
import uuid

from sqlalchemy import Column, ForeignKey, String, Text, Enum, DateTime, func
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class ReportStatus(enum.Enum):
    PENDING = "Pending"
    RESOLVED = "Resolved"
    DISMISSED = "Dismissed"
    DELETED = "Deleted"


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    target_type = Column(String, nullable=False)
    target_id = Column(UUID(as_uuid=True), nullable=False)

    description = Column(Text, nullable=False)

    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    content_snapshot = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    resolver_notes = Column(Text, nullable=True)

    resolved_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id])
    resolver = relationship("User", foreign_keys=[resolved_by_id])
