from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.rbac_repository import RBACRepository


class PermissionService:
    def __init__(self, db: AsyncSession):
        self.rbac_repo = RBACRepository(db)

    async def has_permission(
        self,
        user: User,
        permission_key: str,
    ) -> bool:
        if user.is_superuser:
            return True

        return await self.rbac_repo.user_has_permission(
            user_id=user.id,
            permission_key=permission_key,
        )
