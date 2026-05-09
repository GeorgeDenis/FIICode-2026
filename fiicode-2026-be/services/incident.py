from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from repositories.incident import IncidentRepository
from schemas.incident import IncidentTypeCreateSchema, IncidentTypeUpdateSchema, IncidentReportCreateSchema

incident_repository = IncidentRepository()

CLUSTER_RADIUS_M = 500
CLUSTER_TIME_WINDOW_MIN = 30
AUTO_ACTIVATE_THRESHOLD = 5

class IncidentService:
    def create_incident_type(self, data: IncidentTypeCreateSchema, db: Session):
        return incident_repository.create_incident_type(data, db)

    def get_all_incident_types(self, db: Session):
        return incident_repository.get_all_incident_types(db)

    def get_active_incident_types(self, db: Session):
        return incident_repository.get_active_incident_types(db)

    def update_incident_type(self, type_id: str, data: IncidentTypeUpdateSchema, db: Session):
        incident_type = incident_repository.get_incident_type_by_id(type_id, db)
        if not incident_type:
            raise AppException("Incident type not found", 404)

        if data.name is not None:
            incident_type.name = data.name
        if data.icon is not None:
            incident_type.icon = data.icon
        if data.is_active is not None:
            incident_type.is_active = data.is_active

        return incident_repository.update_incident_type(incident_type, db)

    def submit_report(self, data: IncidentReportCreateSchema, db: Session):
        report = incident_repository.create_report(data, db)

        from repositories.crisis import CrisisRepository
        crisis_repo = CrisisRepository()
        
        # 1. Check if there's already an active crisis (cluster) for this area and type
        existing_cluster = crisis_repo.find_cluster_for_location(
            type_id=str(data.incident_type_id),
            lat=data.latitude,
            lon=data.longitude,
            radius_m=CLUSTER_RADIUS_M,
            db=db,
        )

        if existing_cluster:
            existing_cluster.report_count += 1
            existing_cluster.confidence_score = min(1.0, existing_cluster.report_count / 10.0)
            incident_repository.mark_reports_as_grouped(
                [str(report.id)],
                str(existing_cluster.id),
                db,
            )
            db.commit()
        else:
            nearby_reports = incident_repository.find_nearby_reports(
                type_id=str(data.incident_type_id),
                lat=data.latitude,
                lon=data.longitude,
                radius_m=CLUSTER_RADIUS_M,
                time_window_min=CLUSTER_TIME_WINDOW_MIN,
                db=db,
            )

            report_count = len(nearby_reports)

            if report_count >= AUTO_ACTIVATE_THRESHOLD:
                from services.crisis import CrisisService
                crisis_service = CrisisService()

                incident_type = incident_repository.get_incident_type_by_id(
                    str(data.incident_type_id), db
                )
                type_name = incident_type.name if incident_type else "Unknown"

                crisis_zone = crisis_service.auto_activate_crisis(
                    incident_type_id=str(data.incident_type_id),
                    center_lat=data.latitude,
                    center_lon=data.longitude,
                    radius_m=CLUSTER_RADIUS_M,
                    report_count=report_count,
                    crisis_label=f"{type_name} Cluster",
                    db=db,
                )

                incident_repository.mark_reports_as_grouped(
                    [str(r.id) for r in nearby_reports],
                    str(crisis_zone.id),
                    db,
                )

        return report

    def get_nearby_reports(self, type_id: str, lat: float, lon: float,
                           radius_m: float, db: Session):
        return incident_repository.find_nearby_reports(
            type_id=type_id,
            lat=lat,
            lon=lon,
            radius_m=radius_m,
            time_window_min=CLUSTER_TIME_WINDOW_MIN,
            db=db,
        )
