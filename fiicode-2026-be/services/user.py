from fastapi import UploadFile
from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from repositories.mission import MissionRepository
from repositories.pulse import PulseRepository
from repositories.user import UserRepository
from schemas.user import UpdateUserAccount

user_repository = UserRepository()
pulse_repository = PulseRepository()
mission_repository = MissionRepository()


class UserService:
    def get_all_users(self, user_id: str, db: Session):
        return user_repository.get_all_users(user_id, db)

    def get_users_by_query_by_name(self, query: str, db: Session):
        return user_repository.get_users_by_query(query, db)

    def get_users_by_query_full(self, query: str, db: Session):
        return user_repository.get_users_by_query(query, db)

    def find_user_by_id(self, user_id, db: Session):
        user = user_repository.find_user_by_id(user_id, db)
        if not user:
            raise AppException("User not found", 404)
        reputation = mission_repository.get_user_score_by_missions(db, user.id)
        total_pulses = pulse_repository.get_pulses_count_by_user(user.id, db)
        user.trust_score = reputation.get("score", 0)
        user.rank = reputation.get("rank", "")
        user.rank_label = reputation.get("rank_label", "")
        user.total_missions = reputation.get("total_missions", 0)
        user.missions_completed = reputation.get("missions_completed", 0)
        user.pulses_created = total_pulses
        user.rank_logo = reputation.get("rank_logo", "")
        user.people_helped = reputation.get("people_helped", 0)
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
        reputation = mission_repository.get_user_score_by_missions(db, user.id)
        total_pulses = pulse_repository.get_pulses_count_by_user(user.id, db)
        user.trust_score = reputation.get("score", 0)
        user.rank = reputation.get("rank", "")
        user.rank_label = reputation.get("rank_label", "")
        user.total_missions = reputation.get("total_missions", 0)
        user.missions_completed = reputation.get("missions_completed", 0)
        user.pulses_created = total_pulses
        user.rank_logo = reputation.get("rank_logo", "")
        user.people_helped = reputation.get("people_helped", 0)
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
        user.description = updated_user.description
        user.skills = updated_user.skills
        user.distance_limit_km = updated_user.distance_limit_km
        if updated_user.quiet_hours_start is not None:
            user.quiet_hours_start = updated_user.quiet_hours_start
        if updated_user.quiet_hours_end is not None:
            user.quiet_hours_end = updated_user.quiet_hours_end

        user.birth_year = updated_user.birth_year
        user.gender = updated_user.gender
        user.issuing_city = updated_user.issuing_city

        updated_user = user_repository.update_account_db(user, db)

        return updated_user

    async def update_user_image(self, image: UploadFile, email: str, db: Session):
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

    def find_users_by_distance_and_quiet_hours(self, latitude, longitude, db: Session):
        return user_repository.find_users_by_distance_and_quiet_hours(latitude, longitude, db)

    def update_user_location(self, user_id, latitude, longitude, db: Session):
        user = self.find_user_by_id(user_id, db)
        user.latitude = latitude
        user.longitude = longitude

        return user_repository.update_account_db(user, db)

    def update_user_visibility(self, user_id, visible, db: Session):
        user = self.find_user_by_id(user_id, db)
        if not user:
            raise AppException("User not found", 404)
        user.is_visible = visible
        return user_repository.save_user(user, db)

    def delete_user_by_id(self, user_id, db: Session):
        user = self.find_user_by_id(user_id, db)
        if not user:
            raise AppException("User not found", 404)

        user_repository.delete_user_from_db(user, db)

    def promote_user_to_admin(self, user_id, db: Session):
        user = self.find_user_by_id(user_id, db)
        if not user:
            raise AppException("User not found", 404)

        user.role = 1
        return user_repository.save_user(user, db)
