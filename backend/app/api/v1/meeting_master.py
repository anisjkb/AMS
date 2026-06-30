from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_master import (
    MeetingMasterCreate,
    MeetingMasterListResponse,
    MeetingMasterMessageResponse,
    MeetingMasterResponse,
    MeetingMasterUpdate,
)
from app.services.meeting_master.meeting_master_service import MeetingMasterService


router = APIRouter(prefix="/meeting-master", tags=["Meeting Master"])


@router.get("", response_model=MeetingMasterListResponse)
async def list_meeting_master(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    meeting_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "meeting_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_master.view")),
):
    service = MeetingMasterService(db)

    return await service.list_meeting_master(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        meeting_type=meeting_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{meeting_id}", response_model=MeetingMasterResponse)
async def get_meeting_master(
    meeting_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_master.view")),
):
    service = MeetingMasterService(db)
    return await service.get_meeting_master(meeting_id)


@router.post(
    "",
    response_model=MeetingMasterMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_meeting_master(
    payload: MeetingMasterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.create")),
):
    service = MeetingMasterService(db)

    return await service.create_meeting_master(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{meeting_id}", response_model=MeetingMasterMessageResponse)
async def update_meeting_master(
    meeting_id: int,
    payload: MeetingMasterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.update")),
):
    service = MeetingMasterService(db)

    return await service.update_meeting_master(
        meeting_id=meeting_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{meeting_id}", response_model=MeetingMasterMessageResponse)
async def delete_meeting_master(
    meeting_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.delete")),
):
    service = MeetingMasterService(db)

    return await service.deactivate_meeting_master(
        meeting_id=meeting_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{meeting_id}/restore", response_model=MeetingMasterMessageResponse)
async def restore_meeting_master(
    meeting_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_master.restore")),
):
    service = MeetingMasterService(db)

    return await service.restore_meeting_master(
        meeting_id=meeting_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{meeting_id}/permanent",
    response_model=MeetingMasterMessageResponse,
)
async def permanent_delete_meeting_master(
    meeting_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.meeting_master.permanent_delete")
    ),
):
    service = MeetingMasterService(db)
    return await service.permanent_delete_meeting_master(meeting_id)
