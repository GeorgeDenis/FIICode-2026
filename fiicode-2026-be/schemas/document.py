import base64
import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_serializer


class DocumentScanResponseSchema(BaseModel):
    id: UUID
    doc_type: Optional[str] = None
    status: str
    ai_first_name: Optional[str] = None
    ai_last_name: Optional[str] = None
    ai_birth_year: Optional[int] = None
    ai_issuing_city: Optional[str] = None
    ai_doc_number_masked: Optional[int] = None
    ai_has_face: Optional[bool] = None
    ai_gender: Optional[str] = None
    ai_description: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    finder_id: Optional[UUID] = None
    matched_owner_id: Optional[UUID] = None
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

    @field_serializer('status')
    def serialize_status(self, status, _info):
        return status.value if hasattr(status, 'value') else status


class DocumentPublicResponseSchema(BaseModel):
    id: UUID
    doc_type: Optional[str] = None
    status: str
    ai_first_name: Optional[str] = None
    ai_last_name: Optional[str] = None
    ai_birth_year: Optional[int] = None
    ai_issuing_city: Optional[str] = None
    ai_has_face: Optional[bool] = None
    ai_gender: Optional[str] = None
    finder_id: Optional[UUID] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

    @field_serializer('status')
    def serialize_status(self, status, _info):
        return status.value if hasattr(status, 'value') else status


class DocumentWithImageSchema(DocumentPublicResponseSchema):
    image_data: Optional[bytes] = None

    @field_serializer('image_data', when_used='always')
    def serialize_image(self, image_data: bytes, _info):
        if image_data is None:
            return None
        return f"data:image/jpeg;base64,{base64.b64encode(image_data).decode('utf-8')}"


class DocumentClaimSchema(BaseModel):
    pass


class DocumentStatusUpdateSchema(BaseModel):
    status: str
