import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class UserResponseSchema(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    role: int
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class UpdateUserAccount(BaseModel):
    first_name: str
    last_name: str
    # phone_number: str
