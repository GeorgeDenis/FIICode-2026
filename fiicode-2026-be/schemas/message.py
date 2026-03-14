import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel


class MessageCreateSchema(BaseModel):
    text: str
    receiver_id: UUID


class MessageResponseSchema(BaseModel):
    id: UUID
    text: str
    author_id: UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class MemberSimpleSchema(BaseModel):
    id: UUID
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class ConversationDetailResponseSchema(BaseModel):
    messages: List[MessageResponseSchema]
    members: List[MemberSimpleSchema]


class ConversationResponseSchema(BaseModel):
    id: UUID
    is_group: bool
    name: str | None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

