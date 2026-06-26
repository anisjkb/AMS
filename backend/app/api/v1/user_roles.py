
# E:\Audit\AMS\backend\app\api\v1\user_roles.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.user_role import (
    UserRoleCreate,
    UserRoleMessageResponse,
    UserRoleResponse,
)
from app.services.user_role.user_role_service import UserRoleService

router = APIRouter(prefix="/user-roles", tags=["User Roles"])


@router.get(
    "/users/{user_id}/roles",
    response_model=list[UserRoleResponse],
)
async def list_roles_by_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.user_role.view")),
):
    service = UserRoleService(db)
    return await service.list_roles_by_user(user_id)


@router.post(
    "",
    response_model=UserRoleMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_role_to_user(
    payload: UserRoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user_role.assign")),
):
    service = UserRoleService(db)
    return await service.assign_role_to_user(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{user_role_id}",
    response_model=UserRoleMessageResponse,
)
async def remove_user_role(
    user_role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user_role.remove")),
):
    service = UserRoleService(db)
    return await service.remove_user_role(
        user_role_id=user_role_id,
        updated_by=current_user.user_id,
    )