from fastapi import APIRouter, status, UploadFile, File
from sqlalchemy.orm import Session
from fastapi import Depends
from typing import Annotated


from database import get_db
from dependencies import get_current_user
from schemas.auth import UserLoginSchema, CreateUserSchema, UserLoginOut
from schemas.user import UpdateUserAccount, UserResponseSchema
from services.auth import AuthService
from services.user import UserService

db_dependency = Annotated[Session, Depends(get_db)]

auth_service = AuthService()
user_service = UserService()
auth_router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@auth_router.post("/login")
def login_account(user: UserLoginSchema, db: db_dependency):
    response = auth_service.login_account(user, db)
    return UserLoginOut.model_validate(response).model_dump()


@auth_router.post("/register", status_code=201)
def register_account(user: CreateUserSchema, db: db_dependency):
    response = auth_service.register_account(user, db)
    return response


@auth_router.get("/account", response_model=UserResponseSchema, status_code=200)
def get_account_info(db: db_dependency, user_data=Depends(get_current_user)):
    response = user_service.get_account_info(user_data["email"], db)

    return response


@auth_router.get("/account/{user_id}", response_model=UserResponseSchema, status_code=200)
def get_other_account_info(user_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    response = user_service.get_other_account_info(user_id, db)

    return response


@auth_router.delete("", status_code=204)
def delete_account(db: db_dependency, user_data=Depends(get_current_user)):
    user_service.delete_account(user_data["email"], db)
    return


@auth_router.put("", status_code=200)
def update_account(updated_user: UpdateUserAccount, db: db_dependency, user_data=Depends(get_current_user)):
    response = user_service.update_account(updated_user, user_data["email"], db)
    return UserResponseSchema.model_validate(response).model_dump()


@auth_router.put("/update-image", response_model=UserResponseSchema, status_code=status.HTTP_200_OK)
async def update_image_endpoint(db: db_dependency, user_data=Depends(get_current_user), image: UploadFile = File(None)):
    response = await user_service.update_user_image(image, user_data["email"], db)
    return response
