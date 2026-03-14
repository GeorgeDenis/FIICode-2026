from sqlalchemy.orm import Session

from models.pulse import Pulse
from schemas.pulse import PulseCreateSchema


class PulseRepository:
    def create_pulse(self, request: PulseCreateSchema, db: Session):
        pulse = Pulse(
            author_id=request.author_id,
            type=request.type,
            urgency_level=request.urgency_level,
            content=request.content,
            latitude=request.latitude,
            longitude=request.longitude,
        )

        db.add(pulse)
        db.commit()
        db.refresh(pulse)
        return pulse

    def get_all_pulses(self, db: Session):
        return db.query(Pulse).all()
