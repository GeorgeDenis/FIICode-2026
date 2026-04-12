import base64
from typing import Annotated, List
from fastapi import APIRouter, UploadFile, File, Form, Depends

from database import get_db
from dependencies import get_current_user
from schemas.pet import PetResponseSchema, SimilarPet
from services.pet import PetService
from sqlalchemy.orm import Session

pet_router = APIRouter(prefix="/api/v1/pets", tags=["pets"])
pets_service = PetService()

db_dependency = Annotated[Session, Depends(get_db)]


@pet_router.post("/pet-pulses/ai-match")
async def create_pet_pulse_with_ai(
        db: db_dependency,
        file: UploadFile = File(...),
        status: str = Form(...),
        user_data=Depends(get_current_user)
):
    image_bytes = await file.read()

    return pets_service.create_pet_pulse_with_ai(image_bytes, status, user_data['id'], db)


@pet_router.get("/pets", response_model=List[PetResponseSchema], status_code=200)
def get_pets(db: Session = Depends(get_db)):
    return pets_service.get_pets(db)


@pet_router.get("/my-pulses", response_model=List[PetResponseSchema], status_code=200)
def get_my_pets(db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return pets_service.get_user_pets(user_data['id'], db)


@pet_router.patch("/pet-pulses/{pet_id}", response_model=PetResponseSchema, status_code=200)
def update_pet_status(pet_id: str, status: str, db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return pets_service.update_pet_status(pet_id, status, user_data['id'], db)


@pet_router.delete("/pet-pulses/{pet_id}", status_code=200)
def delete_pet(pet_id: str, db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return pets_service.delete_pet(pet_id, user_data['id'], db)


@pet_router.get("/similar/by-id/{pet_id}", response_model=List[SimilarPet], status_code=200)
def get_similar_pets_by_id(pet_id: str, db: Session = Depends(get_db), user_data=Depends(get_current_user)):
    return pets_service.get_similar_pets_by_id(pet_id, db)


@pet_router.post("/similar/by-photo", response_model=List[SimilarPet], status_code=200)
async def get_similar_pets_by_image(db: Session = Depends(get_db), file: UploadFile = File(...),
                                    user_data=Depends(get_current_user)):
    image_bytes = await file.read()

    return pets_service.get_similar_pets_by_image(image_bytes, db)
