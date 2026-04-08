import datetime
from typing import Tuple, List
from uuid import UUID

from pydantic import BaseModel

from models.pulse import PulseType, UrgencyLevel
from schemas.user import UserResponseSchema, AuthorBasicSchema, SkillTag


class PulseCreateSchema(BaseModel):
    author_id: UUID
    type: PulseType
    urgency_level: UrgencyLevel
    content: str
    skills: List[SkillTag] = []
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class PulseUpdateSchema(BaseModel):
    id: UUID
    type: PulseType
    urgency_level: UrgencyLevel
    content: str
    skills: List[SkillTag] = []
    latitude: float
    longitude: float
    status: str

    class Config:
        from_attributes = True


class PulseResponseSchema(BaseModel):
    id: UUID
    author_id: UUID
    type: PulseType
    urgency_level: UrgencyLevel
    content: str
    skills: List[SkillTag] = []
    latitude: float
    longitude: float
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    likes_count: int = 0
    dislikes_count: int = 0

    author: AuthorBasicSchema

    class Config:
        from_attributes = True


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


class WeatherResponseSchema(BaseModel):
    coord: Tuple[float, float]


class PulseReactionCreateSchema(BaseModel):
    pulse_id: UUID

    is_like: bool

    class Config:
        from_attributes = True


class PulseReactionResponseSchema(BaseModel):
    pulse_id: UUID
    like_count: int
    dislike_count: int

    class Config:
        from_attributes = True
