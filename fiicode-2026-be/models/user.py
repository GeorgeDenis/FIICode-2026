import uuid

from sqlalchemy import Integer, Column, String, DateTime
from sqlalchemy.dialects.postgresql.base import UUID

from database import Base


class User(Base):
    __tablename__ = 'user'

    id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(Integer)
    phone_number = Column(String)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
