from sqlalchemy.orm import Session

from repositories.notification import NotificationRepository
from schemas.notification import NotificationCreateSchema

notification_repository = NotificationRepository()


class NotificationService:
    def add_notification(self, notification: NotificationCreateSchema, db: Session):
        return notification_repository.add_notification(notification, db)

    def get_all_notifications(self, db):
        return notification_repository.get_all_notifications(db)

    def get_all_notifications_by_recepient(self, db, user_id: int):
        return notification_repository.get_all_notifications_by_recepient(db, user_id)

    def get_unread_count_by_user_id(self, db, user_id: int):
        return notification_repository.get_unread_count_by_user_id(db, user_id)

    def mark_notification_as_read(self, db, notification_id: str, user_id: int):
        return notification_repository.mark_notification_as_read(db, notification_id, user_id)
