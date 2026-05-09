from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class UserSchema(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str] = None
    role: int

    class Config:
        from_attributes = True

class TrustedContactBase(BaseModel):
    contact_email: str

class TrustedContactCreate(TrustedContactBase):
    pass

class TrustedContactResponse(BaseModel):
    id: UUID
    user_id: UUID
    contact_id: UUID
    status: str
    created_at: datetime
    contact: Optional[UserSchema] = None
    user: Optional[UserSchema] = None

    class Config:
        from_attributes = True

class SafetyTimerStart(BaseModel):
    duration_minutes: float
    start_latitude: Optional[float] = None
    start_longitude: Optional[float] = None

class SafetyTimerResponse(BaseModel):
    id: UUID
    user_id: UUID
    duration_minutes: float
    expires_at: datetime
    status: str
    start_latitude: Optional[float] = None
    start_longitude: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
