from sqlalchemy.orm import Session
from app.models.general_discussion_issue import GeneralDiscussionIssue

class GeneralDiscussionIssueRepository:

    @staticmethod
    def create(db: Session, obj):
        db_obj = GeneralDiscussionIssue(**obj)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def get_by_id(db: Session, id: int):
        return db.query(GeneralDiscussionIssue).filter(GeneralDiscussionIssue.id == id).first()

    @staticmethod
    def list(db: Session):
        return db.query(GeneralDiscussionIssue).all()

    @staticmethod
    def update(db: Session, db_obj, data: dict):
        for key, value in data.items():
            setattr(db_obj, key, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def deactivate(db: Session, db_obj):
        db_obj.is_active = False
        db.commit()
        return db_obj

    @staticmethod
    def restore(db: Session, db_obj):
        db_obj.is_active = True
        db.commit()
        return db_obj

    @staticmethod
    def delete(db: Session, db_obj):
        db.delete(db_obj)
        db.commit()