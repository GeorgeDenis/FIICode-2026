import datetime
import enum
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, LargeBinary, Enum, Integer, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class DocumentStatus(enum.Enum):
    LOST = "LOST"
    FOUND = "Found"
    CLAIMED = "Claimed"
    ARCHIVED = "Archived"


class Document(Base):
    __tablename__ = 'documents'
    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    doc_type = Column(String)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.LOST)

    image_data = Column(LargeBinary, nullable=False)

    ai_first_name = Column(String, nullable=True)
    ai_last_name = Column(String, nullable=True)
    ai_birth_year = Column(Integer, nullable=True)
    ai_issuing_city = Column(String, nullable=True)
    ai_doc_number_masked = Column(Integer, nullable=True)
    ai_has_face = Column(Boolean, nullable=True)
    ai_description = Column(String, nullable=True)
    embedding = Column(Vector(1536), nullable=True)
    ai_gender = Column(String, nullable=True)
    finder_id = Column(UUID, ForeignKey("users.id"))
    matched_owner_id = Column(UUID, ForeignKey("users.id"))
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
