from typing import List, Optional

from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from models.mission import Mission
from schemas.mission import MissionCreateSchema, MissionUpdateSchema


class MissionRepository:
    def get_all(self, db: Session) -> List[Mission]:
        return db.query(Mission).options(
            joinedload(Mission.pulse),
            joinedload(Mission.hero)
        ).all()

    def get_by_id(self, db: Session, mission_id: UUID) -> Optional[Mission]:
        return db.query(Mission).options(
            joinedload(Mission.pulse),
            joinedload(Mission.hero)
        ).filter(Mission.id == mission_id).first()

    def get_by_hero_id(self, db: Session, hero_id: UUID) -> List[Mission]:
        return db.query(Mission).options(
            joinedload(Mission.pulse),
            joinedload(Mission.hero)
        ).filter(Mission.hero_id == hero_id).all()

    def get_by_pulse_id(self, db: Session, pulse_id: UUID) -> List[Mission]:
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

    def update(self, db: Session, mission_id: UUID, mission_data: MissionUpdateSchema) -> Optional[Mission]:
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
