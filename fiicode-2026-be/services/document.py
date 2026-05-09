import base64
import json
import logging

from decouple import config
from openai import OpenAI
from sqlalchemy.orm import Session

from exceptions.exceptions import AppException
from models.document import Document, DocumentStatus
from repositories.document import DocumentRepository
from repositories.user import UserRepository
from schemas.notification import NotificationCreateSchema
from models.user import User
from repositories.notification import NotificationRepository

OPENAI_KEY = config("OPENAI_KEY")

logger = logging.getLogger(__name__)

DOCUMENT_OCR_PROMPT = """You are a document analysis AI for a civic safety platform called UrbanPulse.

A citizen has found a lost document on the street and uploaded a photo. 
Your job is to extract ONLY safely visible identifying fragments to help reunite the document with its owner.

Analyze the image and return a JSON object with these exact keys:
- "doc_type": one of ["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "OTHER"]
- "first_name": visible first name or partial fragment (e.g. "Geo"), or null if not readable
- "last_name": visible last name or partial fragment, or null
- "birth_year": 4-digit year ONLY (not full date), or null
- "issuing_city": city or region name visible on the document, or null
- "doc_number_last4": last 4 digits/characters of any visible ID or passport number, or null
- "has_face": boolean — true if there is a photo/face region on this document
- "gender": "M", "F", or null if not determinable
- "condition": one of ["clear", "partial", "damaged"] — overall readability
- "detailed_description": A single paragraph describing the document type, readable fields, physical condition, 
  and any notable features. This text will be used for semantic matching. Do NOT include full ID numbers or full dates of birth.

CRITICAL PRIVACY RULES (violation is not acceptable):
- NEVER return a full document number. Return only the last 4 characters, or null.
- NEVER return a full date of birth. Return only the 4-digit year.
- Do NOT attempt to identify any person by face recognition.
- If a field is not clearly readable, return null — do not guess.
"""


class DocumentService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_KEY)
        self.doc_repo = DocumentRepository()
        self.user_repo = UserRepository()

    def scan_and_save(self, image_bytes: bytes, finder_id: str, location_lat: float, location_lng: float, db: Session):
        base64_image = base64.b64encode(image_bytes).decode('utf-8')

        vision_response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": DOCUMENT_OCR_PROMPT},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ]
        )

        ai_data = json.loads(vision_response.choices[0].message.content)
        ai_description = ai_data.get("detailed_description", "")

        embedding_response = self.client.embeddings.create(
            input=ai_description,
            model="text-embedding-3-small"
        )
        embedding_vector = embedding_response.data[0].embedding

        raw_last4 = ai_data.get("doc_number_last4")
        doc_number_masked = None
        if raw_last4 is not None:
            try:
                doc_number_masked = int(str(raw_last4)[-4:])
            except (ValueError, TypeError):
                doc_number_masked = None

        doc = Document(
            doc_type=ai_data.get("doc_type", "OTHER"),
            status=DocumentStatus.FOUND,
            image_data=image_bytes,
            ai_first_name=ai_data.get("first_name"),
            ai_last_name=ai_data.get("last_name"),
            ai_birth_year=ai_data.get("birth_year"),
            ai_issuing_city=ai_data.get("issuing_city"),
            ai_doc_number_masked=doc_number_masked,
            ai_has_face=ai_data.get("has_face"),
            ai_gender=ai_data.get("gender"),
            ai_description=ai_description,
            embedding=embedding_vector,
            finder_id=finder_id,
            location_lat=location_lat,
            location_lng=location_lng,
        )
        self.doc_repo.save(doc, db)

        matched_users = self.smart_match(doc, db)
        notified = []
        for user, score in matched_users:
            self.notify_possible_owner(doc, user, score, finder_id, db)
            notified.append(str(user.id))

        return {
            "id": str(doc.id),
            "doc_type": doc.doc_type,
            "condition": ai_data.get("condition"),
            "extracted": {
                "first_name": doc.ai_first_name,
                "last_name": doc.ai_last_name,
                "birth_year": doc.ai_birth_year,
                "issuing_city": doc.ai_issuing_city,
                "has_face": doc.ai_has_face,
                "gender": doc.ai_gender,
            },
            "possible_owners_notified": len(notified),
        }

    def smart_match(self, doc: Document, db: Session):

        candidates = db.query(User).all()
        matches = []

        first_frag = (doc.ai_first_name or "").strip().lower()
        last_frag = (doc.ai_last_name or "").strip().lower()

        if not first_frag and not last_frag:
            return []

        for user in candidates:
            score = 0.0
            user_first = (user.first_name or "").lower()
            user_last = (user.last_name or "").lower()

            if first_frag and first_frag in user_first:
                score += 0.30
            if last_frag and last_frag in user_last:
                score += 0.20

            if score == 0.0:
                continue

            if score >= 0.30:
                matches.append((user, round(score * 100)))

        matches.sort(key=lambda x: x[1], reverse=True)
        return matches[:3]

    def notify_possible_owner(self, doc: Document, user, score: int, finder_id: str, db: Session):
        from repositories.notification import NotificationRepository
        notification_repo = NotificationRepository()

        doc_label = {
            "ID_CARD": "ID Card",
            "PASSPORT": "Passport",
            "DRIVER_LICENSE": "Driver's License",
            "OTHER": "document",
        }.get(doc.doc_type, "document")

        content = (
            f"A {doc_label} was found nearby that may belong to you. "
            f"Partial match detected ({score}% confidence). "
            f"Open the Documents section to view details and claim it safely."
        )

        notification = NotificationCreateSchema(
            recipient_id=user.id,
            actor_id=finder_id,
            type="Document",
            content=content,
            entity_id=doc.id,
        )
        try:
            notification_repo.add_notification(notification, db)
        except Exception as e:
            logger.error(f"Failed to send document notification: {e}")

    def get_all_found(self, db: Session):
        return self.doc_repo.get_all_found(db)

    def get_my_found(self, finder_id: str, db: Session):
        return self.doc_repo.get_by_finder(finder_id, db)

    def get_matched_to_me(self, user_id: str, db: Session):
        return self.doc_repo.get_by_matched_owner(user_id, db)

    def get_document_by_id(self, doc_id: str, db: Session):
        doc = self.doc_repo.find_by_id(doc_id, db)
        if not doc:
            raise AppException("Document not found", 404)
        return doc

    def get_document_image(self, doc_id: str, requester_id: str, requester_role: int, db: Session):
        doc = self.get_document_by_id(doc_id, db)
        is_admin = requester_role in (1, 2)
        is_owner = doc.matched_owner_id and str(doc.matched_owner_id) == str(requester_id)

        if not is_admin and not is_owner:
            raise AppException("Access denied. Only the verified owner or an admin can view the full document.", 403)

        return doc

    def claim_document(self, doc_id: str, claimer_id: str, db: Session):
        doc = self.get_document_by_id(doc_id, db)

        if doc.status == DocumentStatus.CLAIMED:
            raise AppException("This document has already been claimed.", 400)

        if doc.status == DocumentStatus.ARCHIVED:
            raise AppException("This document has been archived and is no longer available.", 400)

        doc.matched_owner_id = claimer_id
        doc.status = DocumentStatus.CLAIMED
        self.doc_repo.save(doc, db)

        notification_repo = NotificationRepository()

        doc_label = {
            "ID_CARD": "ID Card",
            "PASSPORT": "Passport",
            "DRIVER_LICENSE": "Driver's License",
            "OTHER": "document",
        }.get(doc.doc_type, "document")

        notification = NotificationCreateSchema(
            recipient_id=doc.finder_id,
            actor_id=claimer_id,
            type="DOCUMENT_CLAIMED",
            content=f"Someone has claimed the {doc_label} you found. You can now chat with them to arrange the return.",
            entity_id=doc.id,
        )
        try:
            notification_repo.add_notification(notification, db)
        except Exception as e:
            logger.error(f"Failed to notify finder of claim: {e}")

        return doc

    def update_status(self, doc_id: str, new_status: str, requester_role: int, db: Session):
        if requester_role not in (1, 2):
            raise AppException("Only admins can update document status.", 403)

        doc = self.get_document_by_id(doc_id, db)
        try:
            doc.status = DocumentStatus[new_status.upper()]
        except KeyError:
            raise AppException(f"Invalid status '{new_status}'. Valid: FOUND, CLAIMED, ARCHIVED", 400)

        self.doc_repo.save(doc, db)
        return doc

    def delete_document(self, doc_id: str, requester_id: str, requester_role: int, db: Session):
        doc = self.get_document_by_id(doc_id, db)
        is_admin = requester_role in (1, 2)
        is_finder = str(doc.finder_id) == str(requester_id)

        if not is_admin and not is_finder:
            raise AppException("Only the finder or an admin can delete this document.", 403)

        self.doc_repo.delete(doc, db)
        return {"success": True}
