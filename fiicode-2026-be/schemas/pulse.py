import datetime
from uuid import UUID

from pydantic import BaseModel

from models.pulse import PulseType, UrgencyLevel


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
