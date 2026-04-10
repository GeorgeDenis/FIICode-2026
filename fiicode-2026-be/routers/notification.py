from typing import Annotated, List

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user, is_admin
from schemas.notification import NotificationResponseSchema, NotificationCreateSchema, \
    NotificationUnreadCountResponseSchema, BroadcastNotificationSchema
from services.notification import NotificationService

db_dependency = Annotated[Session, Depends(get_db)]

notification_service = NotificationService()

notification_router = APIRouter(prefix="/api/v1/notification", tags=["notification"])


@notification_router.post("", response_model=NotificationResponseSchema, status_code=201)
def add_notification(notification: NotificationCreateSchema, db: db_dependency):
    return notification_service.add_notification(notification, db)


@notification_router.get("", response_model=List[NotificationResponseSchema], status_code=200)
def get_all_notifications(db: db_dependency, user_data=Depends(get_current_user)):
    return notification_service.get_all_notifications(db)


@notification_router.get("/by-recipient", response_model=List[NotificationResponseSchema], status_code=200)
def get_all_notifications(db: db_dependency, user_data=Depends(get_current_user)):
    return notification_service.get_all_notifications_by_recepient(db, user_data['id'])


@notification_router.get("/unread-count", response_model=NotificationUnreadCountResponseSchema, status_code=200)
def get_unread_count_by_user_id(db: db_dependency, user_data=Depends(get_current_user)):
    return notification_service.get_unread_count_by_user_id(db, user_data['id'])


@notification_router.patch("/mark-as-read/{notification_id}", response_model=NotificationResponseSchema,
                           status_code=200)
def mark_notification_as_read(notification_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return notification_service.mark_notification_as_read(db, notification_id, user_data['id'])


@notification_router.post("/broadcast", status_code=201)
def broadcast_notification(
        broadcast_data: BroadcastNotificationSchema,
        db: db_dependency,
        admin: bool = Depends(is_admin),
        user_data=Depends(get_current_user)
):
    return notification_service.broadcast_to_users(user_data['id'], broadcast_data, db)
