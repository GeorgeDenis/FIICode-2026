from fastapi import UploadFile
from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from repositories.user import UserRepository
from schemas.user import UpdateUserAccount

user_repository = UserRepository()


class UserService:
    def get_all_users(self, db: Session):
        return user_repository.get_all_users(db)

    def get_users_by_query_by_name(self, query: str, db: Session):
        return user_repository.get_users_by_query(query, db)

    def get_users_by_query_full(self, query: str, db: Session):
        return user_repository.get_users_by_query(query, db)

    def find_user_by_id(self, user_id, db: Session):
        user = user_repository.find_user_by_id(user_id, db)
        if not user:
            raise AppException("User not found", 404)
        return user

    def find_user_by_email(self, email, db: Session):
        user = user_repository.find_user_by_email(email, db)
        if not user:
            raise AppException("User not found", 404)
        return user

    def get_account_info(self, email, db: Session):
        user = user_repository.find_user_by_email(email, db)
        if not user:
            raise AppException("User not found", 404)
        return user

    def get_other_account_info(self, user_id, db: Session):
        user = user_repository.find_user_by_id(user_id, db)
        if not user:
            raise AppException("User not found", 404)
        return user

    def delete_account(self, email, db: Session):
        user = user_repository.find_user_by_email(email, db)
        if not user:
            raise AppException("User not found", 404)

        user_repository.delete_user_from_db(user, db)

    def update_account(self, updated_user: UpdateUserAccount, email: str, db: Session):
        user = user_repository.find_user_by_email(email, db)
        if not user:
            raise AppException("User not found", 404)

        user.first_name = updated_user.first_name
        user.last_name = updated_user.last_name
        updated_user = user_repository.update_account_db(user, db)

        return updated_user

    async def update_user_image(self,image: UploadFile, email: str, db: Session):
        user = self.find_user_by_email(email, db)
        if image:
            image_data = await image.read()
            user.image = image_data
            updated_user = user_repository.update_account_db(user, db)
            return updated_user
        else:
            raise AppException("Image not found", 404)

    def get_users_by_ids(self, user_ids: list[str], db: Session):
        users = user_repository.get_users_by_ids(user_ids, db)
        return users
