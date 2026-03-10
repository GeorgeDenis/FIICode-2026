from fastapi import APIRouter, status
from sqlalchemy.orm import Session
from fastapi import Depends
from typing import Annotated

from database import get_db
from dependencies import get_current_user
from schemas.auth import UserLoginSchema, CreateUserSchema, UserLoginOut
from schemas.user import UpdateUserAccount, UserOut
from services.auth import login_account, register_account
from services.user import get_user_by_email, delete_account_by_email, update_user_account
from utils.responses import ok

db_dependency = Annotated[Session, Depends(get_db)]
auth_router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@auth_router.post("/login")
def user_login(user: UserLoginSchema, db: db_dependency):
    response = login_account(user, db)
    return ok(UserLoginOut.model_validate(response).model_dump(), 200)


@auth_router.post("/register", status_code=201)
def user_register(user: CreateUserSchema, db: db_dependency):
    response = register_account(user, db)
    return response


@auth_router.get("/account", status_code=status.HTTP_200_OK)
def get_account_info(db: db_dependency, user_data=Depends(get_current_user)):
    response = get_user_by_email(user_data["email"], db)

    return ok(UserOut.model_validate(response).model_dump(), 200)


@auth_router.delete("", status_code=204)
def delete_account(db: db_dependency, user_data=Depends(get_current_user)):
    delete_account_by_email(user_data["email"], db)
    return


@auth_router.put("", status_code=status.HTTP_200_OK)
def update_account(updated_user: UpdateUserAccount, db: db_dependency, user_data=Depends(get_current_user)):
    response = update_user_account(updated_user, user_data["email"], db)

    return ok(UserOut.model_validate(response).model_dump(), 200)
