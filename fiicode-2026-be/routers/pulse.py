from fastapi import APIRouter, Query
from fastapi.encoders import jsonable_encoder

from sqlalchemy.orm import Session
from fastapi import Depends
from typing import Annotated, List
from database import get_db
from dependencies import get_current_user

from schemas.pulse import PulseCreateSchema, PulseResponseSchema
from services.pulse import PulseService
from connection_manager.feed_manager import feed_manager
from connection_manager.chat_manager import chat_manager
from utils.responses import ok

db_dependency = Annotated[Session, Depends(get_db)]

pulse_service = PulseService()

pulse_router = APIRouter(prefix="/api/v1/pulse", tags=["pulse"])


@pulse_router.post("", response_model=PulseResponseSchema, status_code=201)
async def create_pulse(request: PulseCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    response = pulse_service.create_pulse(request, db)
    pulse_dict = jsonable_encoder(response)
    await feed_manager.broadcast(pulse_dict)
    return response


@pulse_router.get("", response_model=List[PulseResponseSchema], status_code=200)
def get_all_pulses(db: db_dependency, user_data=Depends(get_current_user)):
    return pulse_service.get_all_pulses(db)


@pulse_router.get("/nearby", status_code=200)
def get_nearby_pulses(
        db: db_dependency,
        user_lat: float = Query(...),
        user_lon: float = Query(...),
        radius: float = Query(0.5),
        user_data=Depends(get_current_user)
):
    return pulse_service.get_nearby_pulses(db, user_lat, user_lon, radius)
