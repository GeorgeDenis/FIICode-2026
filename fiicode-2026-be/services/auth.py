from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from repositories.user import UserRepository
from schemas.auth import UserLoginSchema, CreateUserSchema
from utils.jwt_handler import sign_jwt

user_repository = UserRepository()


class AuthService:

    def login_account(self, user: UserLoginSchema, db: Session):
        existing_user = user_repository.find_user_by_email(user.email, db)

        if not existing_user:
            raise AppException("User not found", 404)
        if not existing_user.is_visible:
            raise AppException("Your account was suspended due to not respecting community guidelines.", 403)
        if not user_repository.authenticate_user(user.password.get_secret_value(), existing_user.password):
            raise AppException("Invalid credentials", 401)
        return sign_jwt(existing_user.email, existing_user.id, existing_user.role)

    def register_account(self, user: CreateUserSchema, db: Session):
        if user_repository.find_user_by_email(user.email, db):
            raise AppException("User already exists", 409)
        return user_repository.create_user(user, db)
