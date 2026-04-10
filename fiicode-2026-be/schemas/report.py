import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from models.mission import StatusType, FeedbackType
from models.report import ReportStatus
from schemas.pulse import PulseResponseSchema
from schemas.user import AuthorBasicSchema


class ReportCreateSchema(BaseModel):
    target_type: str
    target_id: UUID
    description: str
    content_snapshot: Optional[str] = None

    class Config:
        from_attributes = True


class ReportResponseSchema(BaseModel):
    id: UUID
    reporter_id: UUID
    target_type: str
    target_id: UUID
    target_type: str
    description: str
    status: ReportStatus
    content_snapshot: Optional[str] = None
    resolver_notes: Optional[str] = None
    created_at: datetime.datetime
    resolved_by_id: Optional[UUID] = None
    resolved_at: Optional[datetime.datetime] = None

    hero: Optional[AuthorBasicSchema] = None

    class Config:
        from_attributes = True


class ReportUpdateSchema(BaseModel):
    id: UUID
    status: ReportStatus
    resolver_notes: Optional[str] = None
    target_type: str
    target_id: UUID

    class Config:
        from_attributes = True