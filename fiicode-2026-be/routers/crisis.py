from typing import Annotated, List, Optional

from fastapi import APIRouter, Query, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from connection_manager.crisis_manager import crisis_manager
from connection_manager.feed_manager import feed_manager
from database import get_db
from dependencies import get_current_user, is_admin
from models.incident import IncidentType
from repositories.crisis import CrisisRepository
from schemas.crisis import (
    CrisisActivateSchema, SafetyCheckInCreateSchema, SafetyCheckInResponseSchema, SafetyCheckInUpdateSchema,
)
from schemas.crisis import CrisisZoneResponseSchema
from schemas.incident import IncidentReportCreateSchema
from schemas.pulse import PulseCreateSchema
from schemas.pulse import PulseResponseSchema
from services.ai_summary import AISummaryService
from services.crisis import CrisisService
from services.incident import IncidentService
from services.pulse import PulseService
from services.voice_sos import VoiceSOSService

db_dependency = Annotated[Session, Depends(get_db)]

crisis_service = CrisisService()
ai_summary_service = AISummaryService()
voice_sos_service = VoiceSOSService()
pulse_service = PulseService()

crisis_router = APIRouter(prefix="/api/v1/crisis", tags=["crisis"])


@crisis_router.post("/voice-sos", response_model=PulseResponseSchema, status_code=201)
async def upload_voice_sos(
        file: UploadFile = File(...),
        latitude: float = Form(...),
        longitude: float = Form(...),
        db: Session = Depends(get_db),
        user_data=Depends(get_current_user)
):
    pulse_data_dict = await voice_sos_service.parse_audio_sos(
        file=file,
        latitude=latitude,
        longitude=longitude,
        author_id=user_data['id']
    )

    pulse_create = PulseCreateSchema(**pulse_data_dict)
    pulse = pulse_service.create_pulse(pulse_create, db)

    incident_service = IncidentService()

    incident_type = db.query(IncidentType).first()

    if incident_type:
        incident_report = IncidentReportCreateSchema(
            reporter_id=user_data['id'],
            incident_type_id=incident_type.id,
            description=pulse_data_dict["content"],
            latitude=latitude,
            longitude=longitude
        )
        report = incident_service.submit_report(incident_report, db)

        crisis_repo = CrisisRepository()
        if report.cluster_id:
            crisis = crisis_repo.get_crisis_by_id(str(report.cluster_id), db)
            if crisis:
                crisis_data = CrisisZoneResponseSchema.model_validate(crisis).model_dump(mode="json")
                await crisis_manager.broadcast({
                    "type": "CRISIS_ACTIVATED",
                    "data": crisis_data,
                })

    pulse_dict = PulseResponseSchema.model_validate(pulse).model_dump(mode="json")
    await feed_manager.broadcast(pulse_dict)

    return pulse


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
