import uuid

from sqlalchemy import Integer, Column, String, DateTime, Float, func, LargeBinary, JSON, Time, Boolean
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(Integer)
    phone_number = Column(String)
    description = Column(String, nullable=True)
    image = Column(LargeBinary)
    skills = Column(JSON, default=list)

    birth_year = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    issuing_city = Column(String, nullable=True)

    distance_limit_km = Column(Float, default=5.0)
    quiet_hours_start = Column(Time, nullable=True)
    quiet_hours_end = Column(Time, nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    is_visible = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    pulses = relationship("Pulse", back_populates="author", cascade="all, delete-orphan")
    pulse_comments = relationship("PulseComment", back_populates="author", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="author", cascade="all, delete-orphan")

    received_notifications = relationship("Notification", foreign_keys="[Notification.recipient_id]",
                                          back_populates="recipient")

    triggered_notifications = relationship("Notification", foreign_keys="[Notification.actor_id]",
                                           back_populates="actor")
    missions = relationship("Mission", back_populates="hero", cascade="all, delete-orphan")
