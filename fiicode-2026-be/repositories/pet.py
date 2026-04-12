from openai import OpenAI
from sqlalchemy.orm import Session, joinedload

from models.pet import PetPulse


class PetRepository:
    def find_pet_by_id(self, pet_id: str, db: Session):
        return db.query(PetPulse).filter(PetPulse.id == pet_id).first()

    def get_user_pets(self, user_id: str, db: Session):
        return db.query(PetPulse).options(joinedload(PetPulse.author)).filter(PetPulse.author_id == user_id).all()

    def get_pets(self, db: Session):
        return db.query(PetPulse).options(joinedload(PetPulse.author)).all()

    def get_similar_pets(self, pet_vector, db: Session):
        distance_expr = PetPulse.embedding.cosine_distance(pet_vector)

        results = (db.query(
            PetPulse,
            distance_expr.label('distance')
        ).options(joinedload(PetPulse.author))
                   .filter(
            PetPulse.status == "LOST"
        ).order_by(
            distance_expr
        ).limit(3).all())

        matches = []
        for pet, distance in results:
            similarity_score = round((1 - distance) * 100)

            if similarity_score > 40:
                matches.append({
                    "id": str(pet.id),
                    "status": pet.status,
                    "match_percentage": similarity_score,
                    "ai_species": pet.ai_species,
                    "ai_primary_color": pet.ai_primary_color,
                    "ai_tags": pet.ai_tags,

                    "image_data": pet.image_data,
                    "created_at": pet.created_at,
                    "author": pet.author
                })

        return matches

    def save_pet(self, pet: PetPulse, db: Session):
        db.add(pet)
        db.commit()
        db.refresh(pet)
        return pet

    def delete_pet(self, pet: PetPulse, db: Session):
        db.delete(pet)
        db.commit()
        return True
