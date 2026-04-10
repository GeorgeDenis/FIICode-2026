from sqlalchemy.orm import Session

from models.mission import StatusType
from models.report import Report, ReportStatus
from schemas.report import ReportCreateSchema


class ReportRepository:
    def get_report_by_id(self, report_id: str, db: Session):
        return db.query(Report).filter(Report.id == report_id).first()

    def create_report(self, request: ReportCreateSchema, user_id: str, db: Session):
        new_report = Report(
            reporter_id=user_id,
            target_type=request.target_type,
            target_id=request.target_id,
            description=request.description,
            content_snapshot=request.content_snapshot,
            status=ReportStatus.PENDING
        )
        return self.save_report(new_report, db)

    def get_all_reports(self, db: Session):
        return db.query(Report).all()


    def save_report(self, report: Report, db: Session):
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def delete_report(self, report: Report, db: Session):
        db.delete(report)
        db.commit()
        return True
