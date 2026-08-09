from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_team_member_role.audit_team_member_role_repository import (
    AuditTeamMemberRoleRepository,
)


class AuditTeamMemberRoleService:

    def __init__(
        self,
        db: AsyncSession,
    ):

        self.db = db
        self.repository = AuditTeamMemberRoleRepository()


    async def list_active_roles(self):

        return await self.repository.get_active_roles(
            self.db
        )