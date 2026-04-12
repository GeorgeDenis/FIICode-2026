import datetime

from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, func, LargeBinary, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from pgvector.sqlalchemy import Vector
import uuid
import enum

from sqlalchemy.orm import relationship

from database import Base


class PetStatus(enum.Enum):
    LOST = "Lost"
    FOUND = "Found"
    RESOLVED = "Resolved"


class PetPulse(Base):
    __tablename__ = "pet_pulses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(PetStatus), default=PetStatus.LOST)

    image_data = Column(LargeBinary, nullable=False)

    ai_species = Column(String, nullable=True)
    ai_primary_color = Column(String, nullable=True)
    ai_tags = Column(ARRAY(String), nullable=True)

    ai_description = Column(String, nullable=True)
    embedding = Column(Vector(1536), nullable=True)

    author_id = Column(UUID, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id])
