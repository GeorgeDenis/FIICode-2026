import base64
import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_serializer


class UserResponseSchema(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    image: Optional[bytes] = None
    role: int
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
    # description: str


class AuthorBasicSchema(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True
