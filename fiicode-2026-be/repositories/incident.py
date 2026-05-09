import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.incident import IncidentType, IncidentReport, ReportStatus
from schemas.incident import IncidentTypeCreateSchema, IncidentReportCreateSchema


class IncidentRepository:
    def create_incident_type(self, data: IncidentTypeCreateSchema, db: Session):
        incident_type = IncidentType(
            name=data.name,
            icon=data.icon,
        )
        db.add(incident_type)
        db.commit()
        db.refresh(incident_type)
        return incident_type

    def get_all_incident_types(self, db: Session):
        return db.query(IncidentType).order_by(IncidentType.name).all()

    def get_active_incident_types(self, db: Session):
        return db.query(IncidentType).filter(IncidentType.is_active == True).order_by(IncidentType.name).all()

    def get_incident_type_by_id(self, type_id: str, db: Session):
        return db.query(IncidentType).filter(IncidentType.id == type_id).first()

    def update_incident_type(self, incident_type: IncidentType, db: Session):
        db.add(incident_type)
        db.commit()
        db.refresh(incident_type)
        return incident_type

    def create_report(self, data: IncidentReportCreateSchema, db: Session):
        report = IncidentReport(
            reporter_id=data.reporter_id,
            incident_type_id=data.incident_type_id,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            status=ReportStatus.PENDING,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def get_report_by_id(self, report_id: str, db: Session):
        return db.query(IncidentReport).filter(IncidentReport.id == report_id).first()

    def find_nearby_reports(self, type_id: str, lat: float, lon: float,
                            radius_m: float, time_window_min: int, db: Session):
        radius_km = radius_m / 1000.0
        cutoff_time = datetime.datetime.now(datetime.UTC) - datetime.timedelta(minutes=time_window_min)

        distance_expr = 6371.0 * func.acos(
            func.cos(func.radians(lat)) * func.cos(func.radians(IncidentReport.latitude)) *
            func.cos(func.radians(IncidentReport.longitude) - func.radians(lon)) +
            func.sin(func.radians(lat)) * func.sin(func.radians(IncidentReport.latitude))
        )

        return db.query(IncidentReport).filter(
            IncidentReport.incident_type_id == type_id,
            IncidentReport.created_at >= cutoff_time,
            IncidentReport.status != ReportStatus.RESOLVED,
            distance_expr <= radius_km,
        ).all()

    def mark_reports_as_grouped(self, report_ids: list, cluster_id: str, db: Session):
        db.query(IncidentReport).filter(
            IncidentReport.id.in_(report_ids)
        ).update({
            IncidentReport.status: ReportStatus.GROUPED,
            IncidentReport.cluster_id: cluster_id,
        }, synchronize_session='fetch')
        db.commit()
