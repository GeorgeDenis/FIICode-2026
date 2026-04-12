from typing import List, Optional

from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from models.mission import Mission, FeedbackType, StatusType
from schemas.mission import MissionCreateSchema, MissionUpdateSchema


class MissionRepository:
    def get_all(self, db: Session):
        return db.query(Mission).options(
            joinedload(Mission.pulse),
            joinedload(Mission.hero)
        ).all()

    def get_by_id(self, db: Session, mission_id: UUID):
        return db.query(Mission).options(
            joinedload(Mission.pulse),
            joinedload(Mission.hero)
        ).filter(Mission.id == mission_id).first()

    def get_by_hero_id(self, db: Session, hero_id: UUID):
        return db.query(Mission).options(
            joinedload(Mission.pulse),
            joinedload(Mission.hero)
        ).filter(Mission.hero_id == hero_id).all()

    def get_by_pulse_id(self, db: Session, pulse_id: UUID):
        return db.query(Mission).options(
            joinedload(Mission.pulse),
            joinedload(Mission.hero)
        ).filter(Mission.pulse_id == pulse_id).all()

    def check_user_in_mission(self, user_id: str, pulse_id: str, db: Session):
        return db.query(Mission).filter(Mission.pulse_id == pulse_id, Mission.hero_id == user_id).first() is not None

    def create(self, db: Session, mission_data: MissionCreateSchema, user_id) -> Mission:
        db_mission = Mission(
            pulse_id=mission_data.pulse_id,
            hero_id=user_id,
            status=mission_data.status
        )
        db.add(db_mission)
        db.commit()
        db.refresh(db_mission)
        return self.get_by_id(db, db_mission.id)

    def update(self, db: Session, mission_id: UUID, mission_data: MissionUpdateSchema):
        db_mission = self.get_by_id(db, mission_id)
        if not db_mission:
            return None

        update_data = mission_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_mission, key, value)

        db.commit()
        db.refresh(db_mission)
        return self.get_by_id(db, db_mission.id)

    def delete(self, db: Session, mission_id: UUID) -> bool:
        db_mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not db_mission:
            return False

        db.delete(db_mission)
        db.commit()
        return True

    def get_user_score_by_missions(self, db: Session, user_id: str):
        missions = db.query(Mission).filter(Mission.hero_id == user_id).all()
        total_missions = len(missions)
        completed_count = 0
        people_helped = 0
        if total_missions == 0:
            score = 20
        else:
            completed = [m for m in missions if m.status == StatusType.COMPLETED]
            completed_count = len(completed)
            positive = [m for m in completed if m.feedback_type == FeedbackType.POSITIVE]
            negative = [m for m in completed if
                        m.feedback_type == FeedbackType.NEGATIVE]
            people_helped = len(set(m.pulse.author_id for m in completed))
            net_successful_missions = len(positive) - len(negative)

            net_successful_missions = max(0, net_successful_missions)

            success_rate = (net_successful_missions / total_missions) * 100
            confidence = min(total_missions / 5, 1.0)

            score = round(success_rate * confidence, 1)
        if score >= 90:
            rank = "Elite Hero"
            label = "Highly Trusted"
            rank_logo = "elite_hero.png"
        elif score >= 50:
            rank = "Reliable Helper"
            label = "Proven Experience"
            rank_logo = "reliable_helper.png"
        elif score >= 20:
            rank = "Rising Star"
            label = "Getting Started"
            rank_logo = "rising_star.png"
        else:
            rank = "Newbie"
            label = "Limited History"
            rank_logo = "newbie.png"

        return {
            "score": score,
            "rank": rank,
            "rank_label": label,
            "total_missions": total_missions,
            "missions_completed": completed_count,
            "rank_logo": rank_logo,
            "people_helped": people_helped
        }
