from typing import List, Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from schemas.user import UserResponseSchema
from services.user import UserService
from utils.responses import ok

db_dependency = Annotated[Session, Depends(get_db)]

user_service = UserService()

user_router = APIRouter(prefix="/api/v1/user", tags=["user"])


@user_router.get("", response_model=List[UserResponseSchema], status_code=200)
def get_all_users(db: db_dependency, user_data=Depends(get_current_user)):
    return user_service.get_all_users(db)


@user_router.get("/search/", response_model=List[UserResponseSchema], status_code=200)
def get_users_by_query(query: str, db: db_dependency, user_data=Depends(get_current_user)):
    return user_service.get_users_by_query_by_name(query, db)

@user_router.get("/by-id/{user_id}", response_model=UserResponseSchema, status_code=200)
def get_user_by_id(user_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return user_service.find_user_by_id(user_id, db)
