import base64
import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, field_serializer


class SkillTag(str, Enum):
    PHYSICAL = "PHYSICAL_HELP"
    MEDICAL = "MEDICAL"
    TOOLS = "TOOLS"
    TRANSPORT = "TRANSPORT"
    PETS = "PET_RESCUE"


class UserResponseSchema(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    image: Optional[bytes] = None
    role: int
    skills: List[SkillTag] = []
    distance_limit_km: Optional[float] = None
    quiet_hours_start: Optional[datetime.time] = None
    quiet_hours_end: Optional[datetime.time] = None

    trust_score: Optional[float] = None
    rank: Optional[str] = None
    rank_label: Optional[str] = None
    total_missions: Optional[int] = None
    missions_completed: Optional[int] = None
    pulses_created: Optional[int] = None
    people_helped: Optional[int] = None
    rank_logo: Optional[str] = None

    pulses_completed: Optional[int] = None
    is_visible: Optional[bool] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

    @field_serializer('image', when_used='always')
    def serialize_image(self, image: bytes, _info):
        if image is None:
            return None
        base64_encoded = base64.b64encode(image).decode('utf-8')
        return f"data:image/jpeg;base64,{base64_encoded}"


class UpdateUserAccount(BaseModel):
    first_name: str
    last_name: str
    # phone_number: str
    description: Optional[str] = None
    phone_number: Optional[str] = None
    skills: List[SkillTag] = []
    distance_limit_km: Optional[float] = None
    quiet_hours_start: Optional[datetime.time] = None
    quiet_hours_end: Optional[datetime.time] = None


class AuthorBasicSchema(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    image: Optional[bytes] = None

    class Config:
        from_attributes = True

    @field_serializer('image', when_used='always')
    def serialize_image(self, image: bytes, _info):
        if image is None:
            return None
        base64_encoded = base64.b64encode(image).decode('utf-8')
        return f"data:image/jpeg;base64,{base64_encoded}"


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
