from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from repositories.user import find_user_by_email, delete_user_from_db, update_account_db
from schemas.user import UpdateUserAccount


def get_user_by_email(email, db: Session):
    user = find_user_by_email(email, db)
    if not user:
        raise AppException("User not found", 404)
    return user


def delete_account_by_email(email, db: Session):
    user = find_user_by_email(email, db)
    if not user:
        raise AppException("User not found", 404)

    delete_user_from_db(user, db)

def update_user_account(updated_user: UpdateUserAccount, email: str, db: Session):
    user = find_user_by_email(email, db)
    if not user:
        raise AppException("User not found", 404)

    user.first_name = updated_user.first_name
    user.last_name = updated_user.last_name
    updated_user = update_account_db(user, db)

    return updated_user