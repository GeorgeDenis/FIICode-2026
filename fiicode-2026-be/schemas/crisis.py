import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel

from models.crisis import CrisisScope, CrisisStatus, CheckInStatus
from schemas.incident import IncidentTypeResponseSchema
from schemas.user import AuthorBasicSchema


class CrisisActivateSchema(BaseModel):
    incident_type_id: UUID
    scope: CrisisScope
    center_latitude: Optional[float] = None
    center_longitude: Optional[float] = None
    radius_meters: Optional[float] = 1000.0
    crisis_label: Optional[str] = None

    class Config:
        from_attributes = True


class CrisisZoneResponseSchema(BaseModel):
    id: UUID
    incident_type_id: UUID
    center_latitude: Optional[float] = None
    center_longitude: Optional[float] = None
    radius_meters: float
    report_count: int
    confidence_score: float
    scope: CrisisScope
    status: CrisisStatus
    activated_by: Optional[UUID] = None
    crisis_label: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_summary_updated_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None

    incident_type: Optional[IncidentTypeResponseSchema] = None

    class Config:
        from_attributes = True


class SafetyCheckInCreateSchema(BaseModel):
    crisis_zone_id: UUID
    status: CheckInStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True


class SafetyCheckInUpdateSchema(BaseModel):
    status: CheckInStatus

    class Config:
        from_attributes = True


class SafetyCheckInResponseSchema(BaseModel):
    id: UUID
    user_id: UUID
    crisis_zone_id: UUID
    status: CheckInStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    user: Optional[AuthorBasicSchema] = None

    class Config:
        from_attributes = True
