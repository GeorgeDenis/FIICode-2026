import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from models.mission import StatusType, FeedbackType
from schemas.pulse import PulseResponseSchema
from schemas.user import AuthorBasicSchema


class MissionCreateSchema(BaseModel):
    pulse_id: UUID
    status: StatusType = StatusType.PENDING

    class Config:
        from_attributes = True


class MissionUpdateSchema(BaseModel):
    status: Optional[StatusType] = None
    feedback_type: Optional[FeedbackType] = None
    feedback_text: Optional[str] = None


    class Config:
        from_attributes = True


class MissionResponseSchema(BaseModel):
    id: UUID
    pulse_id: UUID
    hero_id: UUID
    status: StatusType
    feedback_type: Optional[FeedbackType] = None
    feedback_text: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

    
    pulse: Optional[PulseResponseSchema] = None
    hero: Optional[AuthorBasicSchema] = None

    class Config:
        from_attributes = True
