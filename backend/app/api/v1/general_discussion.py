from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.general_discussion import (
    GeneralDiscussionCreate,
    GeneralDiscussionUpdate,
    GeneralDiscussionResponse,
)
from app.services.general_discussion.general_discussion_service import GeneralDiscussionService

router = APIRouter()
service = GeneralDiscussionService()


@router.post("", response_model=GeneralDiscussionResponse, include_in_schema=False)
@router.post("/", response_model=GeneralDiscussionResponse)
async def create(payload: GeneralDiscussionCreate, db: AsyncSession = Depends(get_db)):
    return await service.create(db, payload)


@router.get("", include_in_schema=False)
@router.get("/")
async def list_all(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await service.list(
        db,
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        is_active=is_active,
    )


@router.get("/{id}", response_model=GeneralDiscussionResponse)
async def get(id: int, db: AsyncSession = Depends(get_db)):
    obj = await service.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="General discussion not found")
    return obj


@router.put("/{id}", response_model=GeneralDiscussionResponse)
async def update(
    id: int,
    payload: GeneralDiscussionUpdate,
    db: AsyncSession = Depends(get_db),
):
    obj = await service.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="General discussion not found")
    return await service.update(db, obj, payload)


@router.delete("/{id}", response_model=GeneralDiscussionResponse)
async def deactivate(id: int, db: AsyncSession = Depends(get_db)):
    obj = await service.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="General discussion not found")
    return await service.deactivate(db, obj)


@router.patch("/{id}/restore", response_model=GeneralDiscussionResponse)
async def restore(id: int, db: AsyncSession = Depends(get_db)):
    obj = await service.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="General discussion not found")
    return await service.restore(db, obj)


@router.delete("/{id}/permanent")
async def permanent_delete(id: int, db: AsyncSession = Depends(get_db)):
    obj = await service.get(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="General discussion not found")
    return await service.permanent_delete(db, obj)
