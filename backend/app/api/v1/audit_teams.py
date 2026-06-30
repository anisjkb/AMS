from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_team import (
    AuditTeamCreate,
    AuditTeamListResponse,
    AuditTeamMessageResponse,
    AuditTeamResponse,
    AuditTeamUpdate,
)
from app.services.audit_team.audit_team_service import AuditTeamService


router = APIRouter(prefix="/audit-teams", tags=["Audit Teams"])


@router.get("", response_model=AuditTeamListResponse)
async def list_audit_teams(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "team_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_team.view")),
):
    service = AuditTeamService(db)

    return await service.list_audit_teams(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{team_id}", response_model=AuditTeamResponse)
async def get_audit_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_team.view")),
):
    service = AuditTeamService(db)
    return await service.get_audit_team(team_id)


@router.post(
    "",
    response_model=AuditTeamMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_team(
    payload: AuditTeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team.create")),
):
    service = AuditTeamService(db)

    return await service.create_audit_team(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{team_id}", response_model=AuditTeamMessageResponse)
async def update_audit_team(
    team_id: int,
    payload: AuditTeamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team.update")),
):
    service = AuditTeamService(db)

    return await service.update_audit_team(
        team_id=team_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{team_id}", response_model=AuditTeamMessageResponse)
async def delete_audit_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team.delete")),
):
    service = AuditTeamService(db)

    return await service.deactivate_audit_team(
        team_id=team_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{team_id}/restore", response_model=AuditTeamMessageResponse)
async def restore_audit_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_team.restore")),
):
    service = AuditTeamService(db)

    return await service.restore_audit_team(
        team_id=team_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{team_id}/permanent",
    response_model=AuditTeamMessageResponse,
)
async def permanent_delete_audit_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_team.permanent_delete")
    ),
):
    service = AuditTeamService(db)
    return await service.permanent_delete_audit_team(team_id)
