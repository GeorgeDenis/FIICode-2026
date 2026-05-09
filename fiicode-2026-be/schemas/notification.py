import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from schemas.user import AuthorBasicSchema


class NotificationCreateSchema(BaseModel):
    recipient_id: UUID
    actor_id: Optional[UUID] = None
    type: str
    content: str
    entity_id: Optional[UUID] = None


    class Config:
        from_attributes = True

class NotificationResponseSchema(BaseModel):
    id: UUID
    type: str
    content: str
    is_read: bool
    created_at: datetime.datetime
    actor: Optional[AuthorBasicSchema] = None
    recipient: AuthorBasicSchema
    entity_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class NotificationUnreadCountResponseSchema(BaseModel):
    count: int
    class Config:
        from_attributes = True


class BroadcastNotificationSchema(BaseModel):
    latitude: float
    longitude: float
    radius: float
    content: str
    type: str