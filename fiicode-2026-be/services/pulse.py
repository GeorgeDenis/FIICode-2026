from sqlalchemy import func
from sqlalchemy.orm import Session

from models.pulse import Pulse
from repositories.pulse import PulseRepository
from schemas.pulse import PulseCreateSchema
from services.user import UserService

pulse_repository = PulseRepository()

user_service = UserService()


class PulseService:
    def create_pulse(self, request: PulseCreateSchema, db: Session):
        user_service.find_user_by_id(request.author_id, db)

        response = pulse_repository.create_pulse(request, db)
        return response

    def get_all_pulses(self, db: Session):
        return pulse_repository.get_all_pulses(db)

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