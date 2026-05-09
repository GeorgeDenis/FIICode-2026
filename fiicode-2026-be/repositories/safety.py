from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from uuid import UUID
from datetime import datetime, timezone
from models.safety import TrustedContact, SafetyTimer

class SafetyRepository:
    def get_trusted_contacts(self, db: Session, user_id: UUID):
        return db.query(TrustedContact).filter(
            or_(
                TrustedContact.user_id == user_id,
                TrustedContact.contact_id == user_id
            )
        ).all()

    def get_trusted_contact_by_users(self, db: Session, user_id: UUID, contact_id: UUID):
        return db.query(TrustedContact).filter(
            TrustedContact.user_id == user_id,
            TrustedContact.contact_id == contact_id
        ).first()

    def create_trusted_contact(self, db: Session, user_id: UUID, contact_id: UUID):
        new_contact = TrustedContact(
            user_id=user_id,
            contact_id=contact_id,
            status='PENDING'
        )
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        return new_contact

    def get_trusted_contact_by_id(self, db: Session, contact_id: UUID):
        return db.query(TrustedContact).filter(TrustedContact.id == contact_id).first()

    def update_trusted_contact_status(self, db: Session, contact: TrustedContact, status: str):
        contact.status = status
        db.commit()
        db.refresh(contact)
        return contact

    def delete_trusted_contact(self, db: Session, contact: TrustedContact):
        db.delete(contact)
        db.commit()

    def create_safety_timer(self, db: Session, user_id: UUID, duration_minutes: float, expires_at: datetime, lat: float, lon: float):
        timer = SafetyTimer(
            user_id=user_id,
            duration_minutes=duration_minutes,
            expires_at=expires_at,
            start_latitude=lat,
            start_longitude=lon,
            status='ACTIVE'
        )
        db.add(timer)
        db.commit()
        db.refresh(timer)
        return timer

    def get_active_timer(self, db: Session, user_id: UUID):
        return db.query(SafetyTimer).filter(
            SafetyTimer.user_id == user_id,
            SafetyTimer.status == 'ACTIVE'
        ).first()

    def get_timer_by_id(self, db: Session, timer_id: UUID):
        return db.query(SafetyTimer).filter(SafetyTimer.id == timer_id).first()

    def update_timer_status(self, db: Session, timer: SafetyTimer, status: str):
        timer.status = status
        db.commit()
        db.refresh(timer)
        return timer
