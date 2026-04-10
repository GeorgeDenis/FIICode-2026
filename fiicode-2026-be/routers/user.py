from typing import List, Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user, is_admin
from schemas.user import UserResponseSchema, LocationUpdate
from services.user import UserService
from utils.responses import ok

db_dependency = Annotated[Session, Depends(get_db)]

user_service = UserService()

user_router = APIRouter(prefix="/api/v1/user", tags=["user"])


@user_router.get("", response_model=List[UserResponseSchema], status_code=200)
def get_all_users(db: db_dependency, user_data=Depends(get_current_user), admin: bool = Depends(is_admin)):
    return user_service.get_all_users(user_data['id'], db)


@user_router.get("/search/", response_model=List[UserResponseSchema], status_code=200)
def get_users_by_query(query: str, db: db_dependency, user_data=Depends(get_current_user)):
    return user_service.get_users_by_query_by_name(query, db)


@user_router.get("/by-id/{user_id}", response_model=UserResponseSchema, status_code=200)
def get_user_by_id(user_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return user_service.find_user_by_id(user_id, db)


@user_router.put("/location")
async def update_user_location(
        request: LocationUpdate,
        db: Session = Depends(get_db),
        user_data=Depends(get_current_user)
):
    response = user_service.update_user_location(user_data['id'], request.latitude, request.longitude, db)
    return {"success": True, "message": "Location updated"}


@user_router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, db: db_dependency, admin: bool = Depends(is_admin)):
    user_service.delete_user_by_id(user_id, db)
    return ok("User deleted successfully")


@user_router.post("/promote/{user_id}", status_code=200)
def promote_user(user_id: str, db: db_dependency, admin: bool = Depends(is_admin)):
    user_service.promote_user_to_admin(user_id, db)
    return ok("User promoted to admin successfully")
