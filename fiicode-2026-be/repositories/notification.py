from sqlalchemy.orm import Session, joinedload

from models.notification import Notification
from schemas.notification import NotificationCreateSchema, NotificationUnreadCountResponseSchema


class NotificationRepository:
    def add_notification(self, notification: NotificationCreateSchema, db: Session):
        new_notification = Notification(
            recipient_id=notification.recipient_id,
            actor_id=notification.actor_id,
            type=notification.type,
            content=notification.content,
            entity_id=notification.entity_id,
        )
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        return new_notification

    def get_all_notifications(self, db: Session):
        return db.query(Notification).all()

    def get_all_notifications_by_recepient(self, db: Session, user_id: int):
        return (db.query(Notification)
                .filter(Notification.recipient_id == user_id)
                .all())

    def get_unread_count_by_user_id(self, db, user_id: int):
        count = db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.is_read == False).count()

        return NotificationUnreadCountResponseSchema(count=count)

    def mark_notification_as_read(self, db, notification_id: str, user_id: int):
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_id == user_id
        ).first()

        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
            return notification
        else:
            return None
