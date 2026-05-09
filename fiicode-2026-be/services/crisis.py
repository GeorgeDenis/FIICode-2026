from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.crisis import CrisisZone, CrisisScope, CrisisStatus
from repositories.crisis import CrisisRepository
from repositories.user import UserRepository
from schemas.crisis import CrisisActivateSchema, SafetyCheckInCreateSchema, SafetyCheckInUpdateSchema, \
    CrisisZoneResponseSchema
from schemas.notification import NotificationCreateSchema
from services.notification import NotificationService

crisis_repository = CrisisRepository()
user_repository = UserRepository()
notification_service = NotificationService()


class CrisisService:

    def activate_crisis(self, admin_id: str, data: CrisisActivateSchema, db: Session):
        crisis_zone = CrisisZone(
            incident_type_id=data.incident_type_id,
            scope=data.scope,
            center_latitude=data.center_latitude,
            center_longitude=data.center_longitude,
            radius_meters=data.radius_meters or 1000.0,
            activated_by=admin_id,
            crisis_label=data.crisis_label,
            report_count=0,
            confidence_score=1.0,
            status=CrisisStatus.ACTIVE,
        )
        crisis_zone = crisis_repository.create_crisis_zone(crisis_zone, db)

        self._notify_users_of_crisis(crisis_zone, db)

        db.refresh(crisis_zone)
        _ = crisis_zone.incident_type
        return crisis_zone

    def auto_activate_crisis(self, incident_type_id: str, center_lat: float,
                             center_lon: float, radius_m: float,
                             report_count: int, crisis_label: str, db: Session):
        crisis_zone = CrisisZone(
            incident_type_id=incident_type_id,
            scope=CrisisScope.LOCAL,
            center_latitude=center_lat,
            center_longitude=center_lon,
            radius_meters=radius_m,
            activated_by=None,
            crisis_label=crisis_label,
            report_count=report_count,
            confidence_score=min(1.0, report_count / 10.0),
            status=CrisisStatus.ACTIVE,
        )
        crisis_zone = crisis_repository.create_crisis_zone(crisis_zone, db)

        self._notify_users_of_crisis(crisis_zone, db)

        db.refresh(crisis_zone)
        _ = crisis_zone.incident_type
        return crisis_zone

    def resolve_crisis(self, crisis_id: str, db: Session):
        crisis_zone = crisis_repository.get_crisis_by_id(crisis_id, db)
        if not crisis_zone:
            raise AppException("Crisis zone not found", 404)
        if crisis_zone.status == CrisisStatus.RESOLVED:
            raise AppException("Crisis is already resolved", 400)

        return crisis_repository.resolve_crisis(crisis_zone, db)

    def get_active_crises(self, db: Session):
        return crisis_repository.get_active_crises(db)

    def get_crisis_status_for_user(self, lat: float, lon: float, db: Session):
        crisis = crisis_repository.get_active_crisis_for_location(lat, lon, db)
        if crisis:
            return CrisisZoneResponseSchema.model_validate(crisis).model_dump(mode="json")
        return None

    def get_crisis_by_id(self, crisis_id: str, db: Session):
        crisis = crisis_repository.get_crisis_by_id(crisis_id, db)
        if not crisis:
            raise AppException("Crisis zone not found", 404)
        return crisis


    def submit_checkin(self, user_id: str, data: SafetyCheckInCreateSchema, db: Session):
        crisis = crisis_repository.get_crisis_by_id(str(data.crisis_zone_id), db)
        if not crisis:
            raise AppException("Crisis zone not found", 404)
        if crisis.status != CrisisStatus.ACTIVE:
            raise AppException("Crisis is not active", 400)

        return crisis_repository.upsert_checkin(user_id, data, db)

    def admin_update_checkin(self, checkin_id: str, data: SafetyCheckInUpdateSchema, db: Session):
        checkin = crisis_repository.get_checkin_by_id(checkin_id, db)
        if not checkin:
            raise AppException("Check-in not found", 404)

        checkin.status = data.status
        return crisis_repository.update_checkin(checkin, db)

    def get_checkins_for_crisis(self, crisis_id: str, db: Session):
        return crisis_repository.get_checkins_by_crisis(crisis_id, db)

    def get_my_checkin(self, user_id: str, crisis_id: str, db: Session):
        return crisis_repository.get_user_checkin(user_id, crisis_id, db)


    def _notify_users_of_crisis(self, crisis_zone: CrisisZone, db: Session):
        if crisis_zone.scope == CrisisScope.GLOBAL:
            users = user_repository.get_all_users(str(crisis_zone.activated_by) if crisis_zone.activated_by else "00000000-0000-0000-0000-000000000000", db)
        else:
            if crisis_zone.center_latitude and crisis_zone.center_longitude:
                radius_km = crisis_zone.radius_meters / 1000.0
                users = user_repository.find_users_in_range(
                    crisis_zone.center_latitude,
                    crisis_zone.center_longitude,
                    radius_km,
                    db,
                )
            else:
                users = []

        label = crisis_zone.crisis_label or "Emergency"
        for user in users:
            notification = NotificationCreateSchema(
                recipient_id=user.id,
                actor_id=crisis_zone.activated_by,
                type="CRISIS",
                content=f"CRISIS ALERT: {label}. Open the app for safety information.",
                entity_id=crisis_zone.id,
            )
            notification_service.add_notification(notification, db)
