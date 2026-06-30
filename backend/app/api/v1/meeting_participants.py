from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_participant import (
    MeetingParticipantCreate,
    MeetingParticipantListResponse,
    MeetingParticipantMessageResponse,
    MeetingParticipantResponse,
    MeetingParticipantUpdate,
)
from app.services.meeting_participant.meeting_participant_service import (
    MeetingParticipantService,
)


router = APIRouter(prefix="/meeting-participants", tags=["Meeting Participants"])


@router.get("", response_model=MeetingParticipantListResponse)
async def list_meeting_participants(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    report_id: int | None = None,
    sort_by: str = "participant_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_participant.view")),
):
    service = MeetingParticipantService(db)

    return await service.list_meeting_participants(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        report_id=report_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{participant_id}", response_model=MeetingParticipantResponse)
async def get_meeting_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_participant.view")),
):
    service = MeetingParticipantService(db)
    return await service.get_meeting_participant(participant_id)


@router.post(
    "",
    response_model=MeetingParticipantMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_meeting_participant(
    payload: MeetingParticipantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_participant.create")),
):
    service = MeetingParticipantService(db)

    return await service.create_meeting_participant(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{participant_id}", response_model=MeetingParticipantMessageResponse)
async def update_meeting_participant(
    participant_id: int,
    payload: MeetingParticipantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_participant.update")),
):
    service = MeetingParticipantService(db)

    return await service.update_meeting_participant(
        participant_id=participant_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{participant_id}", response_model=MeetingParticipantMessageResponse)
async def delete_meeting_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_participant.delete")),
):
    service = MeetingParticipantService(db)

    return await service.deactivate_meeting_participant(
        participant_id=participant_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{participant_id}/restore",
    response_model=MeetingParticipantMessageResponse,
)
async def restore_meeting_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_participant.restore")),
):
    service = MeetingParticipantService(db)

    return await service.restore_meeting_participant(
        participant_id=participant_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{participant_id}/permanent",
    response_model=MeetingParticipantMessageResponse,
)
async def permanent_delete_meeting_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.meeting_participant.permanent_delete")
    ),
):
    service = MeetingParticipantService(db)
    return await service.permanent_delete_meeting_participant(participant_id)
