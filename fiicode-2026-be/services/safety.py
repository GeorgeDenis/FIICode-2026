import asyncio
from datetime import datetime, timedelta, timezone
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.safety import SafetyRepository
from repositories.user import UserRepository
from schemas.safety import TrustedContactCreate, SafetyTimerStart
from schemas.notification import NotificationCreateSchema
from services.notification import NotificationService
from database import SessionLocal

class SafetyService:
    def __init__(self):
        self.repo = SafetyRepository()
        self.user_repo = UserRepository()
        self.notification_service = NotificationService()

    def get_trusted_contacts(self, db: Session, user_id: UUID):
        return self.repo.get_trusted_contacts(db, user_id)

    def request_trusted_contact(self, db: Session, user_id: UUID, req: TrustedContactCreate):
        print(req.contact_email)
        contact_user = self.user_repo.find_user_by_email(req.contact_email, db)
        if not contact_user:
            raise HTTPException(status_code=404, detail="User with this email not found")

        if contact_user.id == user_id:
            raise HTTPException(status_code=400, detail="Cannot add yourself as a trusted contact")

        existing = self.repo.get_trusted_contact_by_users(db, user_id, contact_user.id)
        if existing:
            raise HTTPException(status_code=400, detail="Contact request already exists")

        new_contact = self.repo.create_trusted_contact(db, user_id, contact_user.id)

        notif = NotificationCreateSchema(
            recipient_id=contact_user.id,
            actor_id=user_id,
            type="Trusted-Contact-Request",
            content="Someone wants to add you as a trusted contact.",
            entity_id=new_contact.id
        )
        self.notification_service.add_notification(notif, db)

        return new_contact

    def accept_trusted_contact(self, db: Session, user_id: UUID, contact_id: UUID):
        contact = self.repo.get_trusted_contact_by_id(db, contact_id)
        if not contact:
            raise HTTPException(status_code=404, detail="Contact request not found")

        print(user_id)
        print(contact.contact_id)
        if str(contact.contact_id) != str(user_id):
            raise HTTPException(status_code=403, detail="Not authorized to accept this request")

        return self.repo.update_trusted_contact_status(db, contact, 'ACCEPTED')

    def delete_trusted_contact(self, db: Session, user_id: UUID, contact_id: UUID):
        contact = self.repo.get_trusted_contact_by_id(db, contact_id)
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        if str(contact.user_id) != str(user_id) and str(contact.contact_id) != str(user_id):
            raise HTTPException(status_code=403, detail="Not authorized")

        self.repo.delete_trusted_contact(db, contact)
        return {"message": "Deleted successfully"}

    def start_safety_timer(self, db: Session, user_id: UUID, req: SafetyTimerStart, background_tasks):
        existing = self.repo.get_active_timer(db, user_id)
        if existing:
            raise HTTPException(status_code=400, detail="A safety timer is already active")

        expires_at = datetime.now(timezone.utc) + timedelta(minutes=req.duration_minutes)
        timer = self.repo.create_safety_timer(
            db, user_id, req.duration_minutes, expires_at, req.start_latitude, req.start_longitude
        )

        background_tasks.add_task(self._countdown_timer, timer.id, req.duration_minutes * 60)

        return timer

    def cancel_safety_timer(self, db: Session, user_id: UUID):
        timer = self.repo.get_active_timer(db, user_id)
        if not timer:
            raise HTTPException(status_code=404, detail="No active safety timer found")

        return self.repo.update_timer_status(db, timer, 'CANCELLED')

    def get_active_timer(self, db: Session, user_id: UUID):
        return self.repo.get_active_timer(db, user_id)

    async def _countdown_timer(self, timer_id: UUID, duration_seconds: float):
        await asyncio.sleep(duration_seconds)

        db = SessionLocal()
        try:
            timer = self.repo.get_timer_by_id(db, timer_id)
            if timer and timer.status == 'ACTIVE':
                self.repo.update_timer_status(db, timer, 'TRIGGERED')
                
                contacts = self.repo.get_trusted_contacts(db, timer.user_id)

                for c in contacts:
                    if c.status == 'ACCEPTED':
                        recipient_id = c.contact_id if c.user_id == timer.user_id else c.user_id
                        
                        map_link = ""
                        if timer.start_latitude and timer.start_longitude:
                            map_link = f"Location: https://maps.google.com/?q={timer.start_latitude},{timer.start_longitude}"

                        notif = NotificationCreateSchema(
                            recipient_id=recipient_id,
                            actor_id=timer.user_id,
                            type="Safety-Alert",
                            content=f"URGENT: Safety timer expired! {map_link}",
                            entity_id=timer.id
                        )
                        self.notification_service.add_notification(notif, db)
        finally:
            db.close()
