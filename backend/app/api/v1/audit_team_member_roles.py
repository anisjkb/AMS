from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User

from app.schemas.audit_team_member_role import (
    AuditTeamMemberRoleResponse,
)

from app.services.audit_team_member_role.audit_team_member_role_service import (
    AuditTeamMemberRoleService,
)


router = APIRouter(
    prefix="/audit-team-member-roles",
    tags=["Audit Team Member Roles"],
)


@router.get(
    "",
    response_model=list[AuditTeamMemberRoleResponse],
)
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_team_member_role.view")
    ),
):

    service = AuditTeamMemberRoleService(db)

    return await service.list_active_roles()

