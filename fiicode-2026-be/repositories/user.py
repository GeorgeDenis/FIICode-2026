import datetime
import math

from passlib.context import CryptContext
from pydantic import SecretStr
from sqlalchemy.orm import Session, load_only

from models.user import User
from schemas.auth import CreateUserSchema

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def find_user_by_email(email: str, db: Session) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user(user: CreateUserSchema, db: Session) -> User:
    created_user = User(first_name=user.first_name,
                        last_name=user.last_name,
                        email=user.email,
                        password=bcrypt_context.hash(user.password.get_secret_value()),
                        role=0,
                        created_at=datetime.datetime.now(datetime.UTC),
                        updated_at=datetime.datetime.now(datetime.UTC))
    saved_user = save_user(created_user, db)
    return saved_user


def delete_user_from_db(user: User, db: Session):
    return delete_user(user, db)


def authenticate_user(current_password: str, actual_password: str):
    return bcrypt_context.verify(current_password, actual_password)


def update_account_db(user: User, db: Session) -> User:
    user.updated_at = datetime.datetime.now(datetime.UTC)
    saved_user = save_user(user, db)
    return saved_user


def save_user(user: User, db: Session):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(user: User, db: Session):
    db.delete(user)
    db.commit()
    return True
