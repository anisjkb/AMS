from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.general_discussion_issue import *
from app.services.general_discussion_issue.general_discussion_issue_service import GeneralDiscussionIssueService
from app.repositories.general_discussion_issue_repository import GeneralDiscussionIssueRepository

router = APIRouter()

@router.post("/", response_model=GeneralDiscussionIssueResponse)
def create(payload: GeneralDiscussionIssueCreate, db: Session = Depends(get_db)):
    return GeneralDiscussionIssueService.create(db, payload.dict())


@router.get("/", response_model=GeneralDiscussionIssueList)
def list_all(db: Session = Depends(get_db)):
    items = GeneralDiscussionIssueRepository.list(db)
    return {"items": items, "total": len(items)}


@router.put("/{id}")
def update(id: int, payload: GeneralDiscussionIssueUpdate, db: Session = Depends(get_db)):
    obj = GeneralDiscussionIssueRepository.get_by_id(db, id)
    if not obj:
        raise HTTPException(404, "Not found")

    return GeneralDiscussionIssueService.update(db, obj, payload.dict(exclude_unset=True))


@router.patch("/{id}/deactivate")
def deactivate(id: int, db: Session = Depends(get_db)):
    obj = GeneralDiscussionIssueRepository.get_by_id(db, id)
    return GeneralDiscussionIssueService.deactivate(db, obj)


@router.patch("/{id}/restore")
def restore(id: int, db: Session = Depends(get_db)):
    obj = GeneralDiscussionIssueRepository.get_by_id(db, id)
    return GeneralDiscussionIssueService.restore(db, obj)


@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    obj = GeneralDiscussionIssueRepository.get_by_id(db, id)
    return GeneralDiscussionIssueService.delete(db, obj)