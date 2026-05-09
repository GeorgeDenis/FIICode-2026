from sqlalchemy.orm import Session

from models.document import Document, DocumentStatus


class DocumentRepository:
    def save(self, document: Document, db: Session) -> Document:
        db.add(document)
        db.commit()
        db.refresh(document)
        return document

    def find_by_id(self, doc_id: str, db: Session):
        return db.query(Document).filter(Document.id == doc_id).first()

    def get_all(self, db: Session):
        return db.query(Document).order_by(Document.created_at.desc()).all()

    def get_all_found(self, db: Session):
        return db.query(Document).filter(
            Document.status == DocumentStatus.FOUND
        ).order_by(Document.created_at.desc()).all()

    def get_by_finder(self, finder_id: str, db: Session):
        return db.query(Document).filter(
            Document.finder_id == finder_id
        ).order_by(Document.created_at.desc()).all()

    def get_by_matched_owner(self, user_id: str, db: Session):
        return db.query(Document).filter(
            Document.matched_owner_id == user_id
        ).order_by(Document.created_at.desc()).all()

    def get_similar_documents(self, embedding, db: Session):
        from models.document import Document as Doc
        distance_expr = Doc.embedding.cosine_distance(embedding)

        results = (
            db.query(Doc, distance_expr.label('distance'))
            .filter(Doc.status == DocumentStatus.FOUND)
            .filter(Doc.embedding.is_not(None))
            .order_by(distance_expr)
            .limit(5)
            .all()
        )
        return results

    def delete(self, document: Document, db: Session):
        db.delete(document)
        db.commit()
        return True
