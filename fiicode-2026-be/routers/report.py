from typing import Annotated, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user, is_admin
from schemas.report import ReportCreateSchema, ReportResponseSchema, ReportUpdateSchema
from services.report import ReportService

db_dependency = Annotated[Session, Depends(get_db)]

report_router = APIRouter(prefix="/api/v1/report", tags=["report"])
report_service = ReportService()


@report_router.post("", response_model=ReportResponseSchema, status_code=201)
def create_report(request: ReportCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    return report_service.create_report(request, user_data['id'], db)


@report_router.get("", response_model=List[ReportResponseSchema], status_code=200)
def get_all_reports(db: db_dependency, admin: bool = Depends(is_admin)):
    return report_service.get_all_reports(db)


@report_router.put("", response_model=ReportResponseSchema, status_code=200)
def update_report(request: ReportUpdateSchema, db: db_dependency, admin: bool = Depends(is_admin),
                  user_data=Depends(get_current_user)):
    return report_service.update_report(request,user_data['id'], db)
