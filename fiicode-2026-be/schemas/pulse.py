import datetime
from uuid import UUID

from pydantic import BaseModel

from models.pulse import PulseType, UrgencyLevel
from schemas.user import UserResponseSchema, AuthorBasicSchema


class PulseCreateSchema(BaseModel):
    author_id: UUID
    type: PulseType
    urgency_level: UrgencyLevel
    content: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class PulseResponseSchema(BaseModel):
    id: UUID
    author_id: UUID
    type: PulseType
    urgency_level: UrgencyLevel
    content: str
    latitude: float
    longitude: float
    status: str
    created_at: datetime.datetime


class PulseCommentCreateSchema(BaseModel):
    author_id: UUID
    pulse_id: UUID
    content: str

    class Config:
        from_attributes = True


class PulseCommentResponseSchema(BaseModel):
    id: UUID
    author_id: UUID
    pulse_id: UUID
    content: str
    created_at: datetime.datetime

    author: AuthorBasicSchema

    class Config:
        from_attributes = True
