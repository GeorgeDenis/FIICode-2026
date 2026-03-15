import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class MessageCreateSchema(BaseModel):
    text: str
    receiver_id: Optional[str] = None
    conversation_id: Optional[str] = None


class MessageResponseSchema(BaseModel):
    id: UUID
    text: str
    author_id: UUID
    conversation_id: UUID
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


class ConversationCreateSchema(BaseModel):
    is_group: bool = False
    name: str
    is_private: bool = True

    class Config:
        from_attributes = True


class ConversationResponseSchema(BaseModel):
    id: UUID
    is_group: bool
    name: str | None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class AddUserInGroupSchema(BaseModel):
    conversation_id: str
    user_id: UUID

    class Config:
        from_attributes = True
