from typing import Annotated, List

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user, is_admin
from schemas.incident import (
    IncidentTypeCreateSchema, IncidentTypeResponseSchema, IncidentTypeUpdateSchema,
    IncidentReportCreateSchema, IncidentReportResponseSchema,
)
from services.incident import IncidentService

db_dependency = Annotated[Session, Depends(get_db)]

incident_service = IncidentService()

incident_router = APIRouter(prefix="/api/v1/incident", tags=["incident"])

@incident_router.post("/type", response_model=IncidentTypeResponseSchema, status_code=201)
def create_incident_type(data: IncidentTypeCreateSchema, db: db_dependency,
                         admin: bool = Depends(is_admin)):
    return incident_service.create_incident_type(data, db)


@incident_router.get("/type", response_model=List[IncidentTypeResponseSchema], status_code=200)
def get_incident_types(db: db_dependency, user_data=Depends(get_current_user)):
    return incident_service.get_active_incident_types(db)


@incident_router.get("/type/all", response_model=List[IncidentTypeResponseSchema], status_code=200)
def get_all_incident_types(db: db_dependency, admin: bool = Depends(is_admin)):
    """Admin-only: get all types including inactive ones."""
    return incident_service.get_all_incident_types(db)


@incident_router.put("/type/{type_id}", response_model=IncidentTypeResponseSchema, status_code=200)
def update_incident_type(type_id: str, data: IncidentTypeUpdateSchema, db: db_dependency,
                         admin: bool = Depends(is_admin)):
    return incident_service.update_incident_type(type_id, data, db)

@incident_router.post("/report", response_model=IncidentReportResponseSchema, status_code=201)
async def submit_report(data: IncidentReportCreateSchema, db: db_dependency,
                        user_data=Depends(get_current_user)):
    from connection_manager.crisis_manager import crisis_manager
    from repositories.crisis import CrisisRepository
    from schemas.crisis import CrisisZoneResponseSchema

    report = incident_service.submit_report(data, db)

    crisis_repo = CrisisRepository()
    if report.cluster_id:
        crisis = crisis_repo.get_crisis_by_id(str(report.cluster_id), db)
        if crisis:
            crisis_data = CrisisZoneResponseSchema.model_validate(crisis).model_dump(mode="json")
            await crisis_manager.broadcast({
                "type": "CRISIS_ACTIVATED",
                "data": crisis_data,
            })

    return report


@incident_router.get("/report/nearby", response_model=List[IncidentReportResponseSchema], status_code=200)
def get_nearby_reports(
        db: db_dependency,
        incident_type_id: str = Query(...),
        latitude: float = Query(...),
        longitude: float = Query(...),
        radius: float = Query(500),
        user_data=Depends(get_current_user),
):
    return incident_service.get_nearby_reports(incident_type_id, latitude, longitude, radius, db)
