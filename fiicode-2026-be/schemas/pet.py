import base64
import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import field_serializer, BaseModel

from models.pet import PetStatus
from schemas.user import AuthorBasicSchema


class PetResponseSchema(BaseModel):
    id: UUID
    status: PetStatus
    image_data: Optional[bytes] = None
    ai_species: Optional[str] = None
    ai_primary_color: Optional[str] = None
    ai_tags: Optional[List[str]] = None
    ai_description: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    author: Optional[AuthorBasicSchema] = None

    class Config:
        from_attributes = True

    @field_serializer('image_data', when_used='always')
    def serialize_image(self, image_data: bytes, _info):
        if image_data is None:
            return None
        base64_encoded = base64.b64encode(image_data).decode('utf-8')
        return f"data:image/jpeg;base64,{base64_encoded}"


class SimilarPet(PetResponseSchema):
    match_percentage: Optional[float] = None

    class Config:
        from_attributes = True
