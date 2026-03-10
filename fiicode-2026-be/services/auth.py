from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.user import User
from repositories.user import find_user_by_email, create_user, authenticate_user
from schemas.auth import UserLoginSchema, CreateUserSchema
from utils.jwt_handler import sign_jwt


def login_account(user: UserLoginSchema, db: Session):
    existing_user = find_user_by_email(user.email, db)

    if not existing_user:
        raise AppException("User not found", 404)
    if not authenticate_user(user.password.get_secret_value(), existing_user.password):
        raise AppException("Invalid credentials", 401)
    return sign_jwt(existing_user.email, existing_user.id, existing_user.role)


def register_account(user: CreateUserSchema, db: Session):
    if find_user_by_email(user.email, db):
        raise AppException("User already exists", 409)
    return create_user(user, db)



