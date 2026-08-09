from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_team_member_role import AuditTeamMemberRole


class AuditTeamMemberRoleRepository:

    async def get_active_roles(
        self,
        db: AsyncSession,
    ):

        result = await db.execute(
            select(AuditTeamMemberRole)
            .where(
                AuditTeamMemberRole.is_active.is_(True)
            )
            .order_by(
                AuditTeamMemberRole.role_id
            )
        )

        return result.scalars().all()