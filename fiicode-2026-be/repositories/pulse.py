from sqlalchemy.orm import Session

from models.pulse import Pulse, PulseComment
from schemas.pulse import PulseCreateSchema, PulseCommentCreateSchema


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

    def get_pulse_by_id(self, db: Session, pulse_id: int):
        return db.query(Pulse).filter(Pulse.id == pulse_id).first()

    def add_pulse_comment(self, request: PulseCommentCreateSchema, db: Session):
        pulse_comment = PulseComment(
            author_id=request.author_id,
            pulse_id=request.pulse_id,
            content=request.content,
        )

        db.add(pulse_comment)
        db.commit()
        db.refresh(pulse_comment)
        return pulse_comment

    def get_pulse_comments_by_pulse(self, pulse_id: str, db: Session):
        return db.query(PulseComment).filter(PulseComment.pulse_id == pulse_id).all()
