from typing import Annotated, List, Optional

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from connection_manager.crisis_manager import crisis_manager
from database import get_db
from dependencies import get_current_user, is_admin
from schemas.crisis import (
    CrisisActivateSchema, CrisisZoneResponseSchema,
    SafetyCheckInCreateSchema, SafetyCheckInResponseSchema, SafetyCheckInUpdateSchema,
)
from services.crisis import CrisisService
from services.ai_summary import AISummaryService

db_dependency = Annotated[Session, Depends(get_db)]

crisis_service = CrisisService()
ai_summary_service = AISummaryService()

crisis_router = APIRouter(prefix="/api/v1/crisis", tags=["crisis"])



@crisis_router.post("/activate", response_model=CrisisZoneResponseSchema, status_code=201)
async def activate_crisis(data: CrisisActivateSchema, db: db_dependency,
                          admin: bool = Depends(is_admin),
                          user_data=Depends(get_current_user)):
    crisis = crisis_service.activate_crisis(user_data['id'], data, db)
    crisis_data = CrisisZoneResponseSchema.model_validate(crisis).model_dump(mode="json")
    await crisis_manager.broadcast({
        "type": "CRISIS_ACTIVATED",
        "data": crisis_data,
    })
    return crisis


@crisis_router.post("/resolve/{crisis_id}", response_model=CrisisZoneResponseSchema, status_code=200)
async def resolve_crisis(crisis_id: str, db: db_dependency,
                         admin: bool = Depends(is_admin)):
    crisis = crisis_service.resolve_crisis(crisis_id, db)
    crisis_data = CrisisZoneResponseSchema.model_validate(crisis).model_dump(mode="json")
    await crisis_manager.broadcast({
        "type": "CRISIS_RESOLVED",
        "data": crisis_data,
    })
    return crisis


@crisis_router.get("/active", response_model=List[CrisisZoneResponseSchema], status_code=200)
def get_active_crises(db: db_dependency, user_data=Depends(get_current_user)):
    return crisis_service.get_active_crises(db)


@crisis_router.get("/status", status_code=200)
def get_crisis_status(
        db: db_dependency,
        latitude: float = Query(...),
        longitude: float = Query(...),
        user_data=Depends(get_current_user),
):
    result = crisis_service.get_crisis_status_for_user(latitude, longitude, db)
    if result:
        return {"active": True, "crisis": result}
    return {"active": False, "crisis": None}


@crisis_router.post("/checkin", response_model=SafetyCheckInResponseSchema, status_code=201)
async def submit_checkin(data: SafetyCheckInCreateSchema, db: db_dependency,
                         user_data=Depends(get_current_user)):
    checkin = crisis_service.submit_checkin(user_data['id'], data, db)
    checkin_data = SafetyCheckInResponseSchema.model_validate(checkin).model_dump(mode="json")
    await crisis_manager.broadcast({
        "type": "CHECKIN_UPDATE",
        "data": checkin_data,
    })
    return checkin


@crisis_router.put("/checkin/{checkin_id}", response_model=SafetyCheckInResponseSchema, status_code=200)
async def admin_update_checkin(checkin_id: str, data: SafetyCheckInUpdateSchema,
                               db: db_dependency, admin: bool = Depends(is_admin)):
    checkin = crisis_service.admin_update_checkin(checkin_id, data, db)
    checkin_data = SafetyCheckInResponseSchema.model_validate(checkin).model_dump(mode="json")
    await crisis_manager.broadcast({
        "type": "CHECKIN_UPDATE",
        "data": checkin_data,
    })
    return checkin


@crisis_router.get("/checkin/me", response_model=Optional[SafetyCheckInResponseSchema], status_code=200)
def get_my_checkin(
        db: db_dependency,
        crisis_id: str = Query(...),
        user_data=Depends(get_current_user),
):
    return crisis_service.get_my_checkin(user_data['id'], crisis_id, db)


@crisis_router.get("/checkin/{crisis_id}", response_model=List[SafetyCheckInResponseSchema], status_code=200)
def get_checkins_for_crisis(crisis_id: str, db: db_dependency,
                            user_data=Depends(get_current_user)):
    return crisis_service.get_checkins_for_crisis(crisis_id, db)


@crisis_router.get("/{zone_id}/summary")
def get_crisis_ai_summary(zone_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return ai_summary_service.get_or_generate_summary(zone_id, db)
