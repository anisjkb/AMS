
# E:\Audit\AMS\backend\app\api\v1\role_permissions.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.role_permission import (
    RolePermissionCreate,
    RolePermissionMessageResponse,
    RolePermissionResponse,
)
from app.services.role_permission.role_permission_service import (
    RolePermissionService,
)

router = APIRouter(prefix="/role-permissions", tags=["Role Permissions"])


@router.get(
    "/roles/{role_id}/permissions",
    response_model=list[RolePermissionResponse],
)
async def list_permissions_by_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.role_permission.view")),
):
    service = RolePermissionService(db)
    return await service.list_permissions_by_role(role_id)


@router.post(
    "",
    response_model=RolePermissionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_permission_to_role(
    payload: RolePermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role_permission.assign")),
):
    service = RolePermissionService(db)
    return await service.assign_permission_to_role(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{role_permission_id}",
    response_model=RolePermissionMessageResponse,
)
async def remove_role_permission(
    role_permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role_permission.remove")),
):
    service = RolePermissionService(db)
    return await service.remove_role_permission(
        role_permission_id=role_permission_id,
        updated_by=current_user.user_id,
    )