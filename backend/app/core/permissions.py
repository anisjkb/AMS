from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.permission_service import PermissionService


def require_permission(permission_key: str):
    async def permission_dependency(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        service = PermissionService(db)

        allowed = await service.has_permission(
            user=current_user,
            permission_key=permission_key,
        )

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission_key}",
            )

        return current_user

    return permission_dependency
