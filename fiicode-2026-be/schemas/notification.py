import datetime
from uuid import UUID

from pydantic import BaseModel

from schemas.user import AuthorBasicSchema


class NotificationCreateSchema(BaseModel):
    recipient_id: UUID
    actor_id: UUID
    type: str
    content: str

    class Config:
        from_attributes = True

class NotificationResponseSchema(BaseModel):
    id: UUID
    type: str
    content: str
    is_read: bool
    created_at: datetime.datetime
    actor: AuthorBasicSchema
    recipient: AuthorBasicSchema

    class Config:
        from_attributes = True

class NotificationUnreadCountResponseSchema(BaseModel):
    count: int
    class Config:
        from_attributes = True