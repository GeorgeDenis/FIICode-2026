import enum
import uuid

from sqlalchemy import Column, String, DateTime, Float, Enum, ForeignKey, func, Integer
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class CrisisScope(str, enum.Enum):
    LOCAL = "Local"
    GLOBAL = "Global"


class CrisisStatus(str, enum.Enum):
    ACTIVE = "Active"
    RESOLVED = "Resolved"


class CrisisZone(Base):
    __tablename__ = 'crisis_zones'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    incident_type_id = Column(UUID, ForeignKey("incident_types.id"))

    center_latitude = Column(Float, nullable=True)
    center_longitude = Column(Float, nullable=True)
    radius_meters = Column(Float, default=1000.0)

    report_count = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.0)

    scope = Column(Enum(CrisisScope), default=CrisisScope.LOCAL)
    status = Column(Enum(CrisisStatus), default=CrisisStatus.ACTIVE)

    activated_by = Column(UUID, ForeignKey("users.id"), nullable=True)
    crisis_label = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    incident_type = relationship("IncidentType", back_populates="crisis_zones")
    activator = relationship("User", backref="activated_crises")
    reports = relationship("IncidentReport", back_populates="cluster")
    checkins = relationship("SafetyCheckIn", back_populates="crisis_zone", cascade="all, delete-orphan")


class CheckInStatus(str, enum.Enum):
    SAFE = "Safe"
    NEED_HELP = "Need Help"
    INJURED = "Injured"
    AVAILABLE_TO_HELP = "Available to Help"


class SafetyCheckIn(Base):
    __tablename__ = 'safety_checkins'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id"))
    crisis_zone_id = Column(UUID, ForeignKey("crisis_zones.id"))

    status = Column(Enum(CheckInStatus), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="safety_checkins")
    crisis_zone = relationship("CrisisZone", back_populates="checkins")
