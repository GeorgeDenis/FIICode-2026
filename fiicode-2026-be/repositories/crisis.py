import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from models.crisis import CrisisZone, CrisisStatus, CrisisScope, SafetyCheckIn


class CrisisRepository:

    def create_crisis_zone(self, crisis_zone: CrisisZone, db: Session):
        db.add(crisis_zone)
        db.commit()
        db.refresh(crisis_zone)
        _ = crisis_zone.incident_type
        return crisis_zone

    def get_active_crises(self, db: Session):
        return db.query(CrisisZone).options(
            joinedload(CrisisZone.incident_type)
        ).filter(
            CrisisZone.status == CrisisStatus.ACTIVE
        ).order_by(CrisisZone.created_at.desc()).all()

    def get_crisis_by_id(self, crisis_id: str, db: Session):
        return db.query(CrisisZone).options(
            joinedload(CrisisZone.incident_type)
        ).filter(CrisisZone.id == crisis_id).first()

    def get_active_crisis_for_location(self, lat: float, lon: float, db: Session):
        radius_km_expr = CrisisZone.radius_meters / 1000.0

        cos_expr = (
            func.cos(func.radians(lat)) * func.cos(func.radians(CrisisZone.center_latitude)) *
            func.cos(func.radians(CrisisZone.center_longitude) - func.radians(lon)) +
            func.sin(func.radians(lat)) * func.sin(func.radians(CrisisZone.center_latitude))
        )
        clamped_cos_expr = func.least(1.0, func.greatest(-1.0, cos_expr))
        distance_expr = 6371.0 * func.acos(clamped_cos_expr)

        local_crisis = db.query(CrisisZone).filter(
            CrisisZone.status == CrisisStatus.ACTIVE,
            CrisisZone.scope == CrisisScope.LOCAL,
            distance_expr <= radius_km_expr,
        ).first()

        if local_crisis:
            return local_crisis

        global_crisis = db.query(CrisisZone).filter(
            CrisisZone.status == CrisisStatus.ACTIVE,
            CrisisZone.scope == CrisisScope.GLOBAL,
        ).first()

        return global_crisis

    def find_cluster_for_location(self, type_id: str, lat: float, lon: float,
                                  radius_m: float, db: Session):
        radius_km = radius_m / 1000.0

        cos_expr = (
            func.cos(func.radians(lat)) * func.cos(func.radians(CrisisZone.center_latitude)) *
            func.cos(func.radians(CrisisZone.center_longitude) - func.radians(lon)) +
            func.sin(func.radians(lat)) * func.sin(func.radians(CrisisZone.center_latitude))
        )
        clamped_cos_expr = func.least(1.0, func.greatest(-1.0, cos_expr))
        distance_expr = 6371.0 * func.acos(clamped_cos_expr)

        return db.query(CrisisZone).filter(
            CrisisZone.incident_type_id == type_id,
            CrisisZone.status == CrisisStatus.ACTIVE,
            distance_expr <= radius_km,
        ).first()

    def resolve_crisis(self, crisis_zone: CrisisZone, db: Session):
        from models.incident import IncidentReport, ReportStatus
        crisis_zone.status = CrisisStatus.RESOLVED
        crisis_zone.resolved_at = datetime.datetime.now(datetime.UTC)
        db.add(crisis_zone)
        
        # Resolve all grouped reports so they don't count towards new crises
        db.query(IncidentReport).filter(
            IncidentReport.cluster_id == crisis_zone.id
        ).update({
            IncidentReport.status: ReportStatus.RESOLVED
        }, synchronize_session='fetch')
        
        db.commit()
        db.refresh(crisis_zone)
        _ = crisis_zone.incident_type
        return crisis_zone


    def upsert_checkin(self, user_id: str, checkin_data, db: Session):
        existing = db.query(SafetyCheckIn).filter(
            SafetyCheckIn.user_id == user_id,
            SafetyCheckIn.crisis_zone_id == checkin_data.crisis_zone_id,
        ).first()

        if existing:
            existing.status = checkin_data.status
            existing.latitude = checkin_data.latitude
            existing.longitude = checkin_data.longitude
            existing.updated_at = datetime.datetime.now(datetime.UTC)
            db.commit()
            db.refresh(existing)
            return existing

        checkin = SafetyCheckIn(
            user_id=user_id,
            crisis_zone_id=checkin_data.crisis_zone_id,
            status=checkin_data.status,
            latitude=checkin_data.latitude,
            longitude=checkin_data.longitude,
        )
        db.add(checkin)
        db.commit()
        db.refresh(checkin)
        return checkin

    def get_checkins_by_crisis(self, crisis_id: str, db: Session):
        return db.query(SafetyCheckIn).filter(
            SafetyCheckIn.crisis_zone_id == crisis_id
        ).all()

    def get_checkin_by_id(self, checkin_id: str, db: Session):
        return db.query(SafetyCheckIn).filter(SafetyCheckIn.id == checkin_id).first()

    def get_user_checkin(self, user_id: str, crisis_id: str, db: Session):
        return db.query(SafetyCheckIn).filter(
            SafetyCheckIn.user_id == user_id,
            SafetyCheckIn.crisis_zone_id == crisis_id,
        ).first()

    def update_checkin(self, checkin: SafetyCheckIn, db: Session):
        checkin.updated_at = datetime.datetime.now(datetime.UTC)
        db.add(checkin)
        db.commit()
        db.refresh(checkin)
        return checkin
