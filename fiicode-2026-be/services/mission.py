from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from repositories.mission import MissionRepository
from schemas.mission import MissionCreateSchema, MissionUpdateSchema, MissionResponseSchema
from schemas.notification import NotificationCreateSchema
from services.notification import NotificationService


class MissionService:
    def __init__(self):
        self.mission_repository = MissionRepository()
        self.notification_service = NotificationService()

    def get_all_missions(self, db: Session) -> List[MissionResponseSchema]:
        missions = self.mission_repository.get_all(db)
        return [MissionResponseSchema.model_validate(mission) for mission in missions]

    def get_mission_by_id(self, db: Session, mission_id: UUID) -> MissionResponseSchema:
        mission = self.mission_repository.get_by_id(db, mission_id)
        if not mission:
            raise AppException("Mission not found", 404)
        return MissionResponseSchema.model_validate(mission)

    def get_missions_by_hero(self, db: Session, hero_id: UUID) -> List[MissionResponseSchema]:
        missions = self.mission_repository.get_by_hero_id(db, hero_id)
        return [MissionResponseSchema.model_validate(mission) for mission in missions]

    def get_missions_by_pulse(self, db: Session, pulse_id: UUID) -> List[MissionResponseSchema]:
        missions = self.mission_repository.get_by_pulse_id(db, pulse_id)
        return [MissionResponseSchema.model_validate(mission) for mission in missions]

    def create_mission(self, request: MissionCreateSchema, user_id, db: Session) -> MissionResponseSchema:
        if self.mission_repository.check_user_in_mission(user_id, str(request.pulse_id), db):
            raise AppException("You are already part of this mission!", 400)

        mission = self.mission_repository.create(db, request, user_id)
        notification = NotificationCreateSchema(
            recipient_id=mission.pulse.author_id,
            actor_id=user_id,
            type="Mission",
            content=f"The hero {mission.pulse.author.first_name} {mission.pulse.author.last_name} has accepted your pulse! Check out the mission details.",
            entity_id=mission.id,
        )
        self.notification_service.add_notification(notification, db)
        return MissionResponseSchema.model_validate(mission)

    def update_mission(self, mission_id: UUID, request: MissionUpdateSchema, db: Session) -> MissionResponseSchema:
        mission = self.mission_repository.update(db, mission_id, request)
        if not mission:
            raise AppException("Mission not found", 404)
        return MissionResponseSchema.model_validate(mission)

    def delete_mission(self, mission_id: UUID, db: Session) -> dict:
        deleted = self.mission_repository.delete(db, mission_id)
        if not deleted:
            raise AppException("Mission not found", 404)
        return {"detail": "Mission successfully deleted"}
