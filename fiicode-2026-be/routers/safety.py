from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from database import get_db
from schemas.safety import TrustedContactCreate, TrustedContactResponse, SafetyTimerStart, SafetyTimerResponse
from services.safety import SafetyService
from dependencies import get_current_user

safety_router = APIRouter(prefix="/api/v1/safety", tags=["safety"])
safety_service = SafetyService()

@safety_router.get("/contacts", response_model=List[TrustedContactResponse])
def get_trusted_contacts(db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return safety_service.get_trusted_contacts(db, user_data["id"])

@safety_router.post("/contacts/request", response_model=TrustedContactResponse)
def request_trusted_contact(req: TrustedContactCreate, db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return safety_service.request_trusted_contact(db, user_data["id"], req)

@safety_router.put("/contacts/{contact_id}/accept", response_model=TrustedContactResponse)
def accept_trusted_contact(contact_id: UUID, db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return safety_service.accept_trusted_contact(db, user_data["id"], contact_id)

@safety_router.delete("/contacts/{contact_id}")
def delete_trusted_contact(contact_id: UUID, db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return safety_service.delete_trusted_contact(db, user_data["id"], contact_id)

@safety_router.post("/timer/start", response_model=SafetyTimerResponse)
def start_safety_timer(req: SafetyTimerStart, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return safety_service.start_safety_timer(db, user_data["id"], req, background_tasks)

@safety_router.post("/timer/cancel", response_model=SafetyTimerResponse)
def cancel_safety_timer(db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return safety_service.cancel_safety_timer(db, user_data["id"])

@safety_router.get("/timer/active", response_model=SafetyTimerResponse)
def get_active_timer(db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    timer = safety_service.get_active_timer(db, user_data["id"])
    if not timer:
        raise HTTPException(status_code=404, detail="No active timer")
    return timer
