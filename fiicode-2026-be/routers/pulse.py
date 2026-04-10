from typing import Annotated, List

from fastapi import APIRouter, Query
from fastapi import Depends
from sqlalchemy.orm import Session

from connection_manager.feed_manager import feed_manager
from database import get_db
from dependencies import get_current_user, is_admin
from schemas.pulse import PulseCreateSchema, PulseResponseSchema, PulseCommentResponseSchema, PulseCommentCreateSchema, \
    PulseUpdateSchema, PulseReactionCreateSchema, PulseReactionResponseSchema
from services.pulse import PulseService
from services.weather import WeatherService

db_dependency = Annotated[Session, Depends(get_db)]

pulse_service = PulseService()
weather_service = WeatherService()

pulse_router = APIRouter(prefix="/api/v1/pulse", tags=["pulse"])


@pulse_router.post("", response_model=PulseResponseSchema, status_code=201)
async def create_pulse(request: PulseCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    response = pulse_service.create_pulse(request, db)
    pulse_data = PulseResponseSchema.model_validate(response).model_dump(mode="json")
    await feed_manager.broadcast(pulse_data)
    return response


@pulse_router.put("", response_model=PulseResponseSchema, status_code=200)
async def update_pulse(request: PulseUpdateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    response = pulse_service.update_pulse(request, user_data['id'], db)
    pulse_data = PulseResponseSchema.model_validate(response).model_dump(mode="json")
    await feed_manager.broadcast(pulse_data)
    return response


@pulse_router.get("", response_model=List[PulseResponseSchema], status_code=200)
def get_all_pulses(db: db_dependency, user_data=Depends(get_current_user)):
    return pulse_service.get_all_pulses(db)


@pulse_router.get("/account", response_model=List[PulseResponseSchema], status_code=200)
def get_all_pulses_by_user_limits(db: db_dependency, user_data=Depends(get_current_user)):
    return pulse_service.get_all_pulses_by_user_limits(db, user_data['id'])


@pulse_router.get("/by-id/{pulse_id}", response_model=PulseResponseSchema, status_code=200)
def get_pulse_by_id(pulse_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return pulse_service.get_pulse_by_id(db, pulse_id)


@pulse_router.get("/nearby", status_code=200)
def get_nearby_pulses(
        db: db_dependency,
        user_lat: float = Query(...),
        user_lon: float = Query(...),
        radius: float = Query(0.5),
        user_data=Depends(get_current_user)
):
    return pulse_service.get_nearby_pulses(db, user_lat, user_lon, radius)


@pulse_router.post("/comment", response_model=PulseCommentResponseSchema, status_code=201)
def add_pulse_comment(request: PulseCommentCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    return pulse_service.add_pulse_comment(request, db)


@pulse_router.get("/comment/by-pulse/{pulse_id}", response_model=List[PulseCommentResponseSchema], status_code=200)
def get_pulse_comments_by_pulse(pulse_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return pulse_service.get_pulse_comments_by_pulse(pulse_id, db)


@pulse_router.get("/weather", status_code=200)
async def get_weather_data(latitude: float = Query(...), longitude: float = Query(...),
                           user_data=Depends(get_current_user)):
    return await weather_service.get_weather_data(latitude, longitude)


@pulse_router.post("/react", response_model=PulseReactionResponseSchema, status_code=200)
def react_to_pulse(request: PulseReactionCreateSchema, db: db_dependency, user_data=Depends(get_current_user)):
    response = pulse_service.react_to_pulse(request, user_data['id'], db)
    # pulse_data = PulseResponseSchema.model_validate(response).model_dump(mode="json")
    # feed_manager.broadcast(pulse_data)
    return response


@pulse_router.put("/visible/{pulse_id}", response_model=PulseResponseSchema, status_code=200)
def update_visibility(db: db_dependency, pulse_id: str, visible: bool = Query(...),
                      admin: bool = Depends(is_admin)):
    return pulse_service.update_pulse_visibility(pulse_id, visible, db)


@pulse_router.delete("/{pulse_id}", status_code=204)
def delete_pulse(pulse_id: str, db: db_dependency, admin: bool = Depends(is_admin)):
    pulse_service.delete_pulse_by_admin(pulse_id, db)
    return {"success": True, "message": "Pulse deleted and user notified"}
