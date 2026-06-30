from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_team_member import (
    AuditTeamMemberCreate,
    AuditTeamMemberListResponse,
    AuditTeamMemberMessageResponse,
    AuditTeamMemberResponse,
    AuditTeamMemberUpdate,
)
from app.services.audit_team_member.audit_team_member_service import (
    AuditTeamMemberService,
)


router = APIRouter(prefix="/audit-team-members", tags=["Audit Team Members"])


@router.get("", response_model=AuditTeamMemberListResponse)
async def list_audit_team_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    team_id: int | None = None,
    member_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "team_member_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_team_member.view")),
):
    service = AuditTeamMemberService(db)

    return await service.list_audit_team_members(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        team_id=team_id,
        member_type=member_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{team_member_id}", response_model=AuditTeamMemberResponse)
async def get_audit_team_member(
    team_member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_team_member.view")),
):
    service = AuditTeamMemberService(db)
    return await service.get_audit_team_member(team_member_id)


@router.post(
    "",
    response_model=AuditTeamMemberMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_team_member(
    payload: AuditTeamMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team_member.create")),
):
    service = AuditTeamMemberService(db)

    return await service.create_audit_team_member(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{team_member_id}", response_model=AuditTeamMemberMessageResponse)
async def update_audit_team_member(
    team_member_id: int,
    payload: AuditTeamMemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team_member.update")),
):
    service = AuditTeamMemberService(db)

    return await service.update_audit_team_member(
        team_member_id=team_member_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{team_member_id}", response_model=AuditTeamMemberMessageResponse)
async def delete_audit_team_member(
    team_member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team_member.delete")),
):
    service = AuditTeamMemberService(db)

    return await service.deactivate_audit_team_member(
        team_member_id=team_member_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{team_member_id}/restore",
    response_model=AuditTeamMemberMessageResponse,
)
async def restore_audit_team_member(
    team_member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team_member.restore")),
):
    service = AuditTeamMemberService(db)

    return await service.restore_audit_team_member(
        team_member_id=team_member_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{team_member_id}/permanent",
    response_model=AuditTeamMemberMessageResponse,
)
async def permanent_delete_audit_team_member(
    team_member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_team_member.permanent_delete")
    ),
):
    service = AuditTeamMemberService(db)
    return await service.permanent_delete_audit_team_member(team_member_id)
