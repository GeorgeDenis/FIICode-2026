import datetime

from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.report import ReportStatus
from repositories.pulse import PulseRepository
from repositories.report import ReportRepository
from repositories.user import UserRepository
from routers.chat import chat_service
from routers.pulse import pulse_service
from schemas.notification import NotificationCreateSchema
from services.message import ChatService
from services.pulse import PulseService
from services.user import UserService


class ReportService:
    def __init__(self):
        self.report_repository = ReportRepository()
        self.user_service = UserService()
        self.pulse_service = PulseService()
        self.chat_service = ChatService()

    def create_report(self, request, user_id, db: Session):
        self.user_service.find_user_by_id(user_id, db)
        return self.report_repository.create_report(request, user_id, db)

    def get_all_reports(self, db):
        return self.report_repository.get_all_reports(db)

    def update_report(self, request, user_id: str, db):
        report = self.report_repository.get_report_by_id(request.id, db)
        if not report:
            raise AppException("Report not found", 404)
        report.status = request.status
        report.resolver_notes = request.resolver_notes
        report.resolved_by_id = user_id
        report.resolved_at = datetime.datetime.now(datetime.UTC)

        if request.status == ReportStatus.DELETED:
            if request.target_type == 'Pulse':
                self.pulse_service.update_pulse_visibility(request.target_id, False, db)
            elif request.target_type == 'Message':
                self.chat_service.update_message_visibility(request.target_id, False, db)
            elif request.target_type == 'User':
                self.user_service.update_user_visibility(request.target_id, False, db)

        return self.report_repository.save_report(report, db)
