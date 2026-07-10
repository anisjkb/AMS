from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_minute.entrance_meeting_minute import (
    EntranceMeetingMinuteCreate,
    EntranceMeetingMinuteListResponse,
    EntranceMeetingMinuteMessageResponse,
    EntranceMeetingMinuteReportResponse,
    EntranceMeetingMinuteResponse,
    EntranceMeetingMinuteUpdate,
)
from app.services.meeting_minute.entrance_meeting_minute_service import (
    EntranceMeetingMinuteService,
)


router = APIRouter(
    prefix="/entrance-meeting-minutes",
    tags=["Entrance Meeting Minutes"],
)


@router.get("", response_model=EntranceMeetingMinuteListResponse)
async def list_entrance_meeting_minutes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    meeting_id: int | None = None,
    sort_by: str = "minute_id",
    sort_order: str = "desc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.entrance_meeting_minutes.view")),
):
    service = EntranceMeetingMinuteService(db)

    return await service.list_entrance_meeting_minutes(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        meeting_id=meeting_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{minute_id}", response_model=EntranceMeetingMinuteResponse)
async def get_entrance_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.entrance_meeting_minutes.view")),
):
    service = EntranceMeetingMinuteService(db)
    return await service.get_entrance_meeting_minute(minute_id)


@router.get("/{minute_id}/report", response_model=EntranceMeetingMinuteReportResponse)
async def get_entrance_meeting_minute_report(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.entrance_meeting_minutes.view")),
):
    service = EntranceMeetingMinuteService(db)
    return await service.get_report(minute_id)


@router.get("/{minute_id}/pdf")
async def download_entrance_meeting_minute_pdf(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.entrance_meeting_minutes.view")),
):
    service = EntranceMeetingMinuteService(db)
    pdf_bytes = await service.generate_pdf(minute_id)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="entrance-meeting-minutes-{minute_id}.pdf"'
        },
    )


@router.post(
    "",
    response_model=EntranceMeetingMinuteMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_entrance_meeting_minute(
    payload: EntranceMeetingMinuteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.entrance_meeting_minutes.create")),
):
    service = EntranceMeetingMinuteService(db)

    return await service.create_entrance_meeting_minute(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{minute_id}", response_model=EntranceMeetingMinuteMessageResponse)
async def update_entrance_meeting_minute(
    minute_id: int,
    payload: EntranceMeetingMinuteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.entrance_meeting_minutes.update")),
):
    service = EntranceMeetingMinuteService(db)

    return await service.update_entrance_meeting_minute(
        minute_id=minute_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{minute_id}", response_model=EntranceMeetingMinuteMessageResponse)
async def delete_entrance_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.entrance_meeting_minutes.delete")),
):
    service = EntranceMeetingMinuteService(db)

    return await service.deactivate_entrance_meeting_minute(
        minute_id=minute_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{minute_id}/restore", response_model=EntranceMeetingMinuteMessageResponse)
async def restore_entrance_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.entrance_meeting_minutes.restore")),
):
    service = EntranceMeetingMinuteService(db)

    return await service.restore_entrance_meeting_minute(
        minute_id=minute_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{minute_id}/permanent",
    response_model=EntranceMeetingMinuteMessageResponse,
)
async def permanent_delete_entrance_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.entrance_meeting_minutes.permanent_delete")
    ),
):
    service = EntranceMeetingMinuteService(db)
    return await service.permanent_delete_entrance_meeting_minute(minute_id)
