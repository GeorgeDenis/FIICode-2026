import enum
import uuid

from sqlalchemy import Column, String, DateTime, Float, Enum, ForeignKey, func, Boolean
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class IncidentType(Base):
    __tablename__ = 'incident_types'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reports = relationship("IncidentReport", back_populates="incident_type", cascade="all, delete-orphan")
    crisis_zones = relationship("CrisisZone", back_populates="incident_type")


class ReportStatus(str, enum.Enum):
    PENDING = "Pending"
    GROUPED = "Grouped"
    RESOLVED = "Resolved"
    DISMISSED = "Dismissed"
    DELETED = "Deleted"


class IncidentReport(Base):
    __tablename__ = 'incident_reports'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    reporter_id = Column(UUID, ForeignKey("users.id"))
    incident_type_id = Column(UUID, ForeignKey("incident_types.id"))

    description = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    cluster_id = Column(UUID, ForeignKey("crisis_zones.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    reporter = relationship("User", backref="incident_reports")
    incident_type = relationship("IncidentType", back_populates="reports")
    cluster = relationship("CrisisZone", back_populates="reports")
