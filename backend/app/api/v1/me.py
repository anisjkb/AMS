from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_role import UserRole

router = APIRouter(prefix="/me", tags=["Current User"])


@router.get("/permissions")
async def my_permissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Permission.permission_key,
            Permission.resource_type,
            Permission.resource_key,
            Permission.action,
        )
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(UserRole, UserRole.role_id == RolePermission.role_id)
        .where(
            UserRole.user_id == current_user.id,
            UserRole.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.is_active == True,  # noqa: E712
        )
        .order_by(Permission.resource_type, Permission.resource_key, Permission.action)
    )

    result = await db.execute(stmt)

    permissions = [
        {
            "permission_key": row.permission_key,
            "resource_type": row.resource_type,
            "resource_key": row.resource_key,
            "action": row.action,
        }
        for row in result
    ]

    return {
        "user_id": current_user.user_id,
        "permissions": permissions,
    }
