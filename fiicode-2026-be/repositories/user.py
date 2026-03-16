import datetime
from uuid import UUID

from passlib.context import CryptContext
from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.user import User
from schemas.auth import CreateUserSchema

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


class UserRepository:
    def get_all_users(self, db: Session):
        return db.query(User).all()

    def  get_users_by_query(self, query: str, db: Session):
        search_term = f"%{query}%"

        return db.query(User).filter(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
            )
        ).all()

    def find_user_by_email(self, email: str, db: Session) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def find_user_by_id(self, user_id: UUID, db: Session) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    def create_user(self, user: CreateUserSchema, db: Session) -> User:
        created_user = User(first_name=user.first_name,
                            last_name=user.last_name,
                            email=user.email,
                            password=bcrypt_context.hash(user.password.get_secret_value()),
                            role=0,
                            created_at=datetime.datetime.now(datetime.UTC),
                            updated_at=datetime.datetime.now(datetime.UTC))
        saved_user = self.save_user(created_user, db)
        return saved_user

    def delete_user_from_db(self, user: User, db: Session):
        return self.delete_user(user, db)

    def authenticate_user(self, current_password: str, actual_password: str):
        return bcrypt_context.verify(current_password, actual_password)

    def update_account_db(self, user: User, db: Session) -> User:
        user.updated_at = datetime.datetime.now(datetime.UTC)
        saved_user = self.save_user(user, db)
        return saved_user

    def get_users_by_ids(self, user_ids: list[str], db: Session):
        return db.query(User).filter(User.id.in_(user_ids)).all()

    def save_user(self, user: User, db: Session):
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def delete_user(self, user: User, db: Session):
        db.delete(user)
        db.commit()
        return True
