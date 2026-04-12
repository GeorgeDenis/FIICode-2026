import base64
import json

from decouple import config
from openai import OpenAI
from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.pet import PetPulse
from repositories.pet import PetRepository

OPENAI_KEY = config("OPENAI_KEY")


class PetService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_KEY)
        self.pet_repository = PetRepository()

    def find_pet_by_id(self, pet_id: str, db: Session):
        pet = self.pet_repository.find_pet_by_id(pet_id, db)
        if not pet:
            raise AppException("Pet not found.", 404)
        return pet

    def get_pets(self, db: Session):
        return self.pet_repository.get_pets(db=db)

    def get_user_pets(self, user_id: str, db: Session):
        return self.pet_repository.get_user_pets(user_id=user_id, db=db)

    def update_pet_status(self, pet_id: str, status: str, user_id: str, db: Session):
        pet = self.find_pet_by_id(pet_id, db)
        if pet.author_id != user_id:
            raise AppException("Unauthorized to update this pet pulse.", 403)
        
        pet.status = status
        self.pet_repository.save_pet(pet, db)
        return pet

    def delete_pet(self, pet_id: str, user_id: str, db: Session):
        pet = self.find_pet_by_id(pet_id, db)
        if str(pet.author_id) != str(user_id):
            raise AppException("Unauthorized to delete this pet pulse.", 403)
        
        return self.pet_repository.delete_pet(pet, db)

    def create_pet_pulse_with_ai(self, image_bytes, status, user_id, db: Session):
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        vision_response = self.create_client_response(base64_image)

        ai_data = json.loads(vision_response.choices[0].message.content)
        pet_description = ai_data.get("detailed_description")

        embedding_response = self.client.embeddings.create(
            input=pet_description,
            model="text-embedding-3-small"
        )
        pet_vector = embedding_response.data[0].embedding

        new_pet = PetPulse(
            status=status,
            image_data=image_bytes,
            ai_species=ai_data.get("species"),
            ai_primary_color=ai_data.get("primary_color"),
            ai_tags=ai_data.get("tags"),
            ai_description=pet_description,
            embedding=pet_vector,
            author_id=user_id,
        )

        self.pet_repository.save_pet(new_pet, db)

        return {
            "message": "Pet analyzed and saved!",
            "id": new_pet.id,
            "extracted_traits": {
                "species": new_pet.ai_species,
                "color": new_pet.ai_primary_color,
                "tags": new_pet.ai_tags
            }
        }

    def get_similar_pets_by_id(self, pet_id: str, db: Session):
        pet = self.find_pet_by_id(pet_id, db)
        return self.pet_repository.get_similar_pets(pet.embedding, db)

    def get_similar_pets_by_image(self, image_bytes, db: Session):
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        vision_response = self.create_client_response(base64_image)

        ai_data = json.loads(vision_response.choices[0].message.content)
        pet_description = ai_data.get("detailed_description")

        embedding_response = self.client.embeddings.create(
            input=pet_description,
            model="text-embedding-3-small"
        )
        pet_vector = embedding_response.data[0].embedding

        return self.pet_repository.get_similar_pets(pet_vector, db)

    def create_client_response(self, base64_image):
        return self.client.chat.completions.create(
            model="gpt-5.4-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyze this pet image. Return a JSON object with:
                                    - 'species': string (e.g., Dog, Cat)
                                    - 'primary_color': string
                                    - 'tags': array of strings (max 5 distinct visual features)
                                    - 'detailed_description': string (A highly detailed descriptive paragraph of the pet for semantic matching)."""
                        },
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ]
        )
