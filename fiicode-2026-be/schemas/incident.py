import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from models.incident import ReportStatus


class IncidentTypeCreateSchema(BaseModel):
    name: str
    icon: Optional[str] = None

    class Config:
        from_attributes = True


class IncidentTypeUpdateSchema(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None

    class Config:
        from_attributes = True


class IncidentTypeResponseSchema(BaseModel):
    id: UUID
    name: str
    icon: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class IncidentReportCreateSchema(BaseModel):
    reporter_id: UUID
    incident_type_id: UUID
    description: Optional[str] = None
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class IncidentReportResponseSchema(BaseModel):
    id: UUID
    reporter_id: UUID
    incident_type_id: UUID
    description: Optional[str] = None
    latitude: float
    longitude: float
    status: ReportStatus
    cluster_id: Optional[UUID] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    incident_type: Optional[IncidentTypeResponseSchema] = None

    class Config:
        from_attributes = True
