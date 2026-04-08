from sqlalchemy import func
from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.pulse import Pulse
from repositories.pulse import PulseRepository
from schemas.notification import NotificationCreateSchema
from schemas.pulse import PulseCreateSchema, PulseCommentCreateSchema, PulseUpdateSchema, PulseReactionCreateSchema
from services.notification import NotificationService
from services.user import UserService

pulse_repository = PulseRepository()

user_service = UserService()
notification_service = NotificationService()


class PulseService:
    def create_pulse(self, request: PulseCreateSchema, db: Session):
        user_service.find_user_by_id(request.author_id, db)
        available_users = user_service.find_users_by_distance_and_quiet_hours(request.latitude, request.longitude, db)
        users_to_alert = [
            hero for hero in available_users
            if hero.id != request.author_id and any(skill in hero.skills for skill in request.skills)
        ]
        response = pulse_repository.create_pulse(request, db)
        for user in users_to_alert:
            notification = NotificationCreateSchema(
                recipient_id=user.id,
                actor_id=request.author_id,
                type="Pulse",
                content=f"You seem like a good match for this pulse!",
                entity_id=response.id,
            )
            notification_service.add_notification(notification, db)
        return response

    def update_pulse(self, request: PulseUpdateSchema, user_id: str, db: Session):
        pulse = pulse_repository.get_pulse_by_id(db, request.id)
        if not pulse:
            raise AppException("Pulse not found", 404)
        if str(pulse.author_id) != user_id:
            raise AppException("You don't have permission to edit this pulse!", 403)

        pulse.type = request.type
        pulse.urgency_level = request.urgency_level
        pulse.content = request.content
        pulse.latitude = request.latitude
        pulse.longitude = request.longitude
        pulse.status = request.status

        response = pulse_repository.update_pulse(pulse, db)
        return response

    def get_all_pulses(self, db: Session):
        return pulse_repository.get_all_pulses(db)

    def get_all_pulses_by_user_limits(self, db: Session, user_id: str):
        user = user_service.find_user_by_id(user_id, db)
        return pulse_repository.get_all_pulses_by_user_limits(user, db)

    def get_pulse_by_id(self, db: Session, pulse_id: str):
        return pulse_repository.get_pulse_by_id(db, pulse_id)

    def get_nearby_pulses(self, db: Session, user_lat: float, user_lon: float, radius: float):
        distance_expr = (
                6371 * func.acos(
            func.cos(func.radians(user_lat)) * func.cos(func.radians(Pulse.latitude)) *
            func.cos(func.radians(Pulse.longitude) - func.radians(user_lon)) +
            func.sin(func.radians(user_lat)) * func.sin(func.radians(Pulse.latitude))
        )
        )
        nearby_pulses = (
            db.query(Pulse)
            .filter(distance_expr <= radius)
            .order_by(Pulse.created_at.desc())
            .all()
        )

        return nearby_pulses

    def add_pulse_comment(self, request: PulseCommentCreateSchema, db: Session):
        response = pulse_repository.add_pulse_comment(request, db)
        author = user_service.find_user_by_id(request.author_id, db)
        if response:
            pulse = pulse_repository.get_pulse_by_id(db, request.pulse_id)
            if not pulse:
                raise AppException("Pulse not found", 404)
            notification = NotificationCreateSchema(
                recipient_id=pulse.author_id,
                actor_id=request.author_id,
                type="Comment",
                content=f"User {author.email} commented on your pulse.",
                entity_id=pulse.id,
            )
            notification_service.add_notification(notification, db)
            return response
        return None

    def get_pulse_comments_by_pulse(self, pulse_id: str, db: Session):
        return pulse_repository.get_pulse_comments_by_pulse(pulse_id, db)

    def react_to_pulse(self, request: PulseReactionCreateSchema, user_id: str, db: Session):
        pulse = pulse_repository.get_pulse_by_id(db, request.pulse_id)
        if not pulse:
            raise AppException("Pulse not found", 404)

        return pulse_repository.react_to_pulse(request, user_id, db)
