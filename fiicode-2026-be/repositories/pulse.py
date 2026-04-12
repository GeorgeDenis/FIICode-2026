import datetime

from sqlalchemy import func, case
from sqlalchemy.orm import Session, joinedload

from exceptions.exceptions import AppException
from models.pulse import Pulse, PulseComment, PulseReaction, PulseReaction
from models.user import User
from schemas.pulse import PulseCreateSchema, PulseCommentCreateSchema, PulseReactionCreateSchema, \
    PulseReactionResponseSchema
from utils.utils import haversine_distance


class PulseRepository:
    def create_pulse(self, request: PulseCreateSchema, db: Session):
        pulse = Pulse(
            author_id=request.author_id,
            type=request.type,
            urgency_level=request.urgency_level,
            content=request.content,
            latitude=request.latitude,
            skills=request.skills,
            longitude=request.longitude,
        )

        db.add(pulse)
        db.commit()
        pulse_with_author = db.query(Pulse).options(
            joinedload(Pulse.author)
        ).filter(Pulse.id == pulse.id).first()
        return pulse_with_author

    def update_pulse(self, pulse: Pulse, db: Session):
        pulse.updated_at = datetime.datetime.now(datetime.UTC)
        return self.save_pulse(pulse, db)

    def get_pulse_by_id(self, db: Session, pulse_id):
        return db.query(Pulse).filter(Pulse.id == pulse_id).first()

    def get_all_pulses(self, db: Session):
        reaction_counts = db.query(
            PulseReaction.pulse_id,
            func.count(case((PulseReaction.is_like == True, 1))).label("likes"),
            func.count(case((PulseReaction.is_like == False, 1))).label("dislikes")
        ).group_by(PulseReaction.pulse_id).subquery()

        results = db.query(
            Pulse,
            func.coalesce(reaction_counts.c.likes, 0).label("likes_count"),
            func.coalesce(reaction_counts.c.dislikes, 0).label("dislikes_count"),
        ).options(
            joinedload(Pulse.author)
        ).outerjoin(
            reaction_counts, Pulse.id == reaction_counts.c.pulse_id
        ).order_by(
            Pulse.updated_at.desc()
        ).all()

        formatted_pulses = []
        for pulse_obj, likes, dislikes in results:
            pulse_dict = pulse_obj.__dict__.copy()

            pulse_dict["likes_count"] = likes
            pulse_dict["dislikes_count"] = dislikes

            formatted_pulses.append(pulse_dict)
        return formatted_pulses

    def get_all_pulses_by_user_limits(self, user: User, db: Session):
        limit_km = user.distance_limit_km or 10.0

        all_pulses = db.query(Pulse).filter(Pulse.latitude.is_not(None)).all()

        nearby_pulses = []

        for pulse in all_pulses:
            dist = haversine_distance(
                user.latitude,
                user.longitude,
                pulse.latitude,
                pulse.longitude
            )

            if dist <= limit_km and pulse.author_id != user.id:
                nearby_pulses.append(pulse)

        return nearby_pulses

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

    def react_to_pulse(self, request: PulseReactionCreateSchema, user_id: str, db: Session):
        existing_reaction = db.query(PulseReaction).filter(
            PulseReaction.user_id == user_id,
            PulseReaction.pulse_id == request.pulse_id
        ).first()

        if existing_reaction:
            if existing_reaction.is_like == request.is_like:
                db.delete(existing_reaction)
                db.commit()
            else:
                existing_reaction.is_like = request.is_like
                db.commit()
        else:
            existing_reaction = PulseReaction(
                user_id=user_id,
                pulse_id=request.pulse_id,
                is_like=request.is_like,
            )
            db.add(existing_reaction)
            db.commit()
        like_count = db.query(PulseReaction).filter(PulseReaction.pulse_id == request.pulse_id,
                                                    PulseReaction.is_like == True).count()

        dislike_count = db.query(PulseReaction).filter(PulseReaction.pulse_id == request.pulse_id,
                                                       PulseReaction.is_like != True).count()
        if like_count >= 3:
            self.set_pulse_verified_status(str(request.pulse_id), True, db)
        elif like_count <= 3 and dislike_count > like_count:
            self.set_pulse_verified_status(str(request.pulse_id), False, db)

        response = PulseReactionResponseSchema(
            pulse_id=request.pulse_id,
            like_count=like_count,
            dislike_count=dislike_count,
        )

        return response

    def set_pulse_verified_status(self, pulse_id: str, status: bool, db: Session):
        pulse = db.query(Pulse).filter(Pulse.id == pulse_id).first()
        if not pulse:
            raise AppException("Pulse not found", 404)
        pulse.is_verified = status

        return self.save_pulse(pulse, db)

    def get_pulses_count_by_user(self, user_id: str, db: Session):
        return db.query(Pulse).filter(Pulse.author_id == user_id).count()

    def save_pulse(self, pulse: Pulse, db: Session):
        db.add(pulse)
        db.commit()
        db.refresh(pulse)
        return pulse

    def delete_pulse(self, pulse: Pulse, db: Session):
        db.delete(pulse)
        db.commit()
        return True
