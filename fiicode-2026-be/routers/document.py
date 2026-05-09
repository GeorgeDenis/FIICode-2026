from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user, is_admin
from schemas.document import (
    DocumentPublicResponseSchema,
    DocumentStatusUpdateSchema,
    DocumentWithImageSchema,
)
from services.document import DocumentService

document_router = APIRouter(prefix="/api/v1/documents", tags=["documents"])
document_service = DocumentService()

db_dependency = Annotated[Session, Depends(get_db)]


@document_router.post("/scan", status_code=201)
async def scan_document(
        db: db_dependency,
        file: UploadFile = File(...),
        location_lat: Optional[float] = Form(None),
        location_lng: Optional[float] = Form(None),
        user_data=Depends(get_current_user),
):
    image_bytes = await file.read()
    return document_service.scan_and_save(
        image_bytes=image_bytes,
        finder_id=user_data["id"],
        location_lat=location_lat,
        location_lng=location_lng,
        db=db,
    )


@document_router.get("", response_model=List[DocumentPublicResponseSchema], status_code=200)
def get_all_found_documents(db: db_dependency, user_data=Depends(get_current_user)):
    return document_service.get_all_found(db)


@document_router.get("/mine/found", response_model=List[DocumentPublicResponseSchema], status_code=200)
def get_my_found_documents(db: db_dependency, user_data=Depends(get_current_user)):
    return document_service.get_my_found(user_data["id"], db)


@document_router.get("/mine/matches", response_model=List[DocumentPublicResponseSchema], status_code=200)
def get_documents_matched_to_me(db: db_dependency, user_data=Depends(get_current_user)):
    return document_service.get_matched_to_me(user_data["id"], db)


@document_router.get("/{doc_id}", response_model=DocumentPublicResponseSchema, status_code=200)
def get_document_by_id(doc_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return document_service.get_document_by_id(doc_id, db)


@document_router.get("/{doc_id}/image", response_model=DocumentWithImageSchema, status_code=200)
def get_document_image(doc_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return document_service.get_document_image(
        doc_id=doc_id,
        requester_id=user_data["id"],
        requester_role=user_data["role"],
        db=db,
    )


@document_router.post("/{doc_id}/claim", status_code=200)
def claim_document(doc_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return document_service.claim_document(
        doc_id=doc_id,
        claimer_id=user_data["id"],
        db=db,
    )


@document_router.patch("/{doc_id}/status", status_code=200)
def update_document_status(
        doc_id: str,
        payload: DocumentStatusUpdateSchema,
        db: db_dependency,
        _admin=Depends(is_admin),
        user_data=Depends(get_current_user),
):
    return document_service.update_status(
        doc_id=doc_id,
        new_status=payload.status,
        requester_role=user_data["role"],
        db=db,
    )


@document_router.delete("/{doc_id}", status_code=200)
def delete_document(doc_id: str, db: db_dependency, user_data=Depends(get_current_user)):
    return document_service.delete_document(
        doc_id=doc_id,
        requester_id=user_data["id"],
        requester_role=user_data["role"],
        db=db,
    )
