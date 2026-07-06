from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.permissions import require_permission
from app.models.user import User
from app.schemas.meeting_participant import (
    MeetingParticipantCreate,
    MeetingParticipantEntityContactOptionsResponse,
    MeetingParticipantInternalTeamOptionsResponse,
    MeetingParticipantListResponse,
    MeetingParticipantMessageResponse,
    MeetingParticipantResponse,
)
from app.services.meeting_participant.meeting_participant_service import (
    MeetingParticipantService,
)


router = APIRouter(prefix="/meeting-participants", tags=["Meeting Participants"])


def get_user_key(user: User) -> str:
    return str(
        getattr(user, "user_id", None)
        or getattr(user, "id", None)
        or getattr(user, "email", None)
        or getattr(user, "username", None)
        or "system"
    )


@router.get("", response_model=MeetingParticipantListResponse)
async def list_meeting_participants(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=500),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "participant_id",
    sort_order: str = "desc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_participant.view")),
):
    service = MeetingParticipantService(db)
    return await service.list_meeting_participants(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get(
    "/options/internal-teams",
    response_model=MeetingParticipantInternalTeamOptionsResponse,
)
async def list_internal_team_options(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_participant.view")),
):
    service = MeetingParticipantService(db)
    return await service.list_internal_team_options()


@router.get(
    "/options/entity-contacts",
    response_model=MeetingParticipantEntityContactOptionsResponse,
)
async def list_entity_contact_options(
    meeting_id: int = Query(..., gt=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_participant.view")),
):
    service = MeetingParticipantService(db)
    return await service.list_entity_contact_options(meeting_id)


@router.get("/{participant_id}", response_model=MeetingParticipantResponse)
async def get_meeting_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_participant.view")),
):
    service = MeetingParticipantService(db)
    return await service.get_meeting_participant(participant_id)


@router.post("", response_model=MeetingParticipantMessageResponse)
async def create_meeting_participant(
    payload: MeetingParticipantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_participant.create")),
):
    service = MeetingParticipantService(db)
    return await service.create_meeting_participant(
        payload=payload,
        created_by=get_user_key(current_user),
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
        updated_by=get_user_key(current_user),
    )


@router.patch("/{participant_id}/restore", response_model=MeetingParticipantMessageResponse)
async def restore_meeting_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_participant.restore")),
):
    service = MeetingParticipantService(db)
    return await service.restore_meeting_participant(
        participant_id=participant_id,
        updated_by=get_user_key(current_user),
    )


@router.delete("/{participant_id}/permanent", response_model=MeetingParticipantMessageResponse)
async def permanent_delete_meeting_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.meeting_participant.permanent_delete")
    ),
):
    service = MeetingParticipantService(db)
    return await service.permanent_delete_meeting_participant(participant_id)
