from typing import List, Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from schemas.mission import MissionCreateSchema, MissionUpdateSchema, MissionResponseSchema
from services.mission import MissionService

db_dependency = Annotated[Session, Depends(get_db)]

mission_router = APIRouter(prefix="/api/v1/mission", tags=["mission"])
mission_service = MissionService()


@mission_router.get("", response_model=List[MissionResponseSchema], status_code=200)
def get_all_missions(db: db_dependency, user_data=Depends(get_current_user)):
    return mission_service.get_all_missions(db)


@mission_router.get("/by-id/{mission_id}", response_model=MissionResponseSchema, status_code=200)
def get_mission_by_id(mission_id: UUID, db: db_dependency, user_data=Depends(get_current_user)):
    return mission_service.get_mission_by_id(db, mission_id)


@mission_router.get("/by-hero/{hero_id}", response_model=List[MissionResponseSchema], status_code=200)
def get_missions_by_hero(hero_id: UUID, db: db_dependency, user_data=Depends(get_current_user)):
    return mission_service.get_missions_by_hero(db, hero_id)


@mission_router.post("", response_model=MissionResponseSchema, status_code=201)
def create_mission(request: MissionCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    return mission_service.create_mission(request, user_data['id'], db)


@mission_router.put("/{mission_id}", response_model=MissionResponseSchema, status_code=200)
def update_mission(mission_id: UUID, request: MissionUpdateSchema, db: db_dependency,
                   user_data=Depends(get_current_user)):
    return mission_service.update_mission(mission_id, request, db)


@mission_router.delete("/{mission_id}", status_code=200)
def delete_mission(mission_id: UUID, db: db_dependency, user_data=Depends(get_current_user)):
    return mission_service.delete_mission(mission_id, db)
