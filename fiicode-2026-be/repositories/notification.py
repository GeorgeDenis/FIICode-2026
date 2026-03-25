from sqlalchemy.orm import Session

from models.notification import Notification
from schemas.notification import NotificationCreateSchema, NotificationUnreadCountResponseSchema


class NotificationRepository:
    def add_notification(self, notification: NotificationCreateSchema, db: Session):
        new_notification = Notification(
            recipient_id=notification.recipient_id,
            actor_id=notification.actor_id,
            type=notification.type,
            content=notification.content,
        )
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        return new_notification

    def get_all_notifications(self, db: Session):
        return db.query(Notification).all()

    def get_unread_count_by_user_id(self, db, user_id: int):
        count = db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.is_read == False).count()

        return NotificationUnreadCountResponseSchema(count=count)
