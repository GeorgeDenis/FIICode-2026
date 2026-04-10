from sqlalchemy.orm import Session

from repositories.notification import NotificationRepository
from repositories.user import UserRepository
from schemas.notification import NotificationCreateSchema, BroadcastNotificationSchema

notification_repository = NotificationRepository()
user_repository = UserRepository()


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

    def broadcast_to_users(self, admin_id: str, broadcast_data: BroadcastNotificationSchema, db: Session):
        users = user_repository.find_users_in_range(
            broadcast_data.latitude,
            broadcast_data.longitude,
            broadcast_data.radius,
            db
        )

        for user in users:
            notification = NotificationCreateSchema(
                recipient_id=user.id,
                actor_id=admin_id,
                type=broadcast_data.type,
                content=broadcast_data.content,
                entity_id=None
            )
            self.add_notification(notification, db)

        return {"success": True, "users_notified": len(users)}
