from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_minute.exit_meeting_minute import (
    ExitMeetingMinuteCreate,
    ExitMeetingMinuteListResponse,
    ExitMeetingMinuteMessageResponse,
    ExitMeetingMinuteReportResponse,
    ExitMeetingMinuteResponse,
    ExitMeetingMinuteUpdate,
)
from app.services.meeting_minute.exit_meeting_minute_service import (
    ExitMeetingMinuteService,
)


router = APIRouter(
    prefix="/exit-meeting-minutes",
    tags=["Exit Meeting Minutes"],
)


@router.get(
    "",
    response_model=ExitMeetingMinuteListResponse,
)
async def list_exit_meeting_minutes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    meeting_id: int | None = Query(
        default=None,
        gt=0,
    ),
    is_locked: bool | None = None,
    sort_by: str = "minute_id",
    sort_order: str = "desc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minutes.view"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await service.list_exit_meeting_minutes(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        meeting_id=meeting_id,
        is_locked=is_locked,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get(
    "/{minute_id}",
    response_model=ExitMeetingMinuteResponse,
)
async def get_exit_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minutes.view"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await service.get_exit_meeting_minute(
        minute_id
    )


@router.get(
    "/{minute_id}/report",
    response_model=ExitMeetingMinuteReportResponse,
)
async def get_exit_meeting_minute_report(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minutes.view"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await service.get_report(minute_id)


@router.post(
    "",
    response_model=ExitMeetingMinuteMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_exit_meeting_minute(
    payload: ExitMeetingMinuteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.create"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await service.create_exit_meeting_minute(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch(
    "/{minute_id}",
    response_model=ExitMeetingMinuteMessageResponse,
)
async def update_exit_meeting_minute(
    minute_id: int,
    payload: ExitMeetingMinuteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.update"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await service.update_exit_meeting_minute(
        minute_id=minute_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{minute_id}",
    response_model=ExitMeetingMinuteMessageResponse,
)
async def deactivate_exit_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.delete"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await service.deactivate_exit_meeting_minute(
        minute_id=minute_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{minute_id}/restore",
    response_model=ExitMeetingMinuteMessageResponse,
)
async def restore_exit_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.restore"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await service.restore_exit_meeting_minute(
        minute_id=minute_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{minute_id}/permanent",
    response_model=ExitMeetingMinuteMessageResponse,
)
async def permanent_delete_exit_meeting_minute(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.permanent_delete"
        )
    ),
):
    service = ExitMeetingMinuteService(db)

    return await (
        service.permanent_delete_exit_meeting_minute(
            minute_id
        )
    )
