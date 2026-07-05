from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_type import (
    MeetingTypeCreate,
    MeetingTypeListResponse,
    MeetingTypeMessageResponse,
    MeetingTypeResponse,
    MeetingTypeUpdate,
)
from app.services.meeting_type.meeting_type_service import MeetingTypeService


router = APIRouter(prefix="/meeting-type", tags=["Meeting Type"])


@router.get("", response_model=MeetingTypeListResponse)
async def list_meeting_type(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    meeting_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "meeting_type_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_master.view")),
):
    service = MeetingTypeService(db)

    return await service.list_meeting_type(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        meeting_type=meeting_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{meeting_type_id}", response_model=MeetingTypeResponse)
async def get_meeting_type(
    meeting_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_master.view")),
):
    service = MeetingTypeService(db)
    return await service.get_meeting_type(meeting_type_id)


@router.post(
    "",
    response_model=MeetingTypeMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_meeting_type(
    payload: MeetingTypeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.create")),
):
    service = MeetingTypeService(db)

    return await service.create_meeting_type(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{meeting_type_id}", response_model=MeetingTypeMessageResponse)
async def update_meeting_type(
    meeting_type_id: int,
    payload: MeetingTypeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.update")),
):
    service = MeetingTypeService(db)

    return await service.update_meeting_type(
        meeting_type_id=meeting_type_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{meeting_type_id}", response_model=MeetingTypeMessageResponse)
async def delete_meeting_type(
    meeting_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.delete")),
):
    service = MeetingTypeService(db)

    return await service.deactivate_meeting_type(
        meeting_type_id=meeting_type_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{meeting_type_id}/restore", response_model=MeetingTypeMessageResponse)
async def restore_meeting_type(
    meeting_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.restore")),
):
    service = MeetingTypeService(db)

    return await service.restore_meeting_type(
        meeting_type_id=meeting_type_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{meeting_type_id}/permanent",
    response_model=MeetingTypeMessageResponse,
)
async def permanent_delete_meeting_type(
    meeting_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.meeting_master.permanent_delete")
    ),
):
    service = MeetingTypeService(db)
    return await service.permanent_delete_meeting_type(meeting_type_id)
