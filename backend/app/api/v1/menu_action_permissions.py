
# E:\Audit\AMS\backend\app\api\v1\menu_action_permissions.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu_action_permission import (
    MenuActionPermissionActionResponse,
    MenuActionPermissionCreate,
    MenuActionPermissionMessageResponse,
    MenuActionPermissionResponse,
)
from app.services.menu_action_permission.menu_action_permission_service import (
    MenuActionPermissionService,
)

router = APIRouter(
    prefix="/menu-action-permissions",
    tags=["Menu Action Permissions"],
)


@router.get(
    "/actions",
    response_model=list[MenuActionPermissionActionResponse],
)
async def list_active_menu_actions_for_mapping(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.menu_action_permission.view")
    ),
):
    service = MenuActionPermissionService(db)
    return await service.list_active_menu_actions()


@router.get(
    "/actions/{menu_action_id}/permissions",
    response_model=list[MenuActionPermissionResponse],
)
async def list_permissions_by_menu_action(
    menu_action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.menu_action_permission.view")
    ),
):
    service = MenuActionPermissionService(db)
    return await service.list_permissions_by_menu_action(menu_action_id)


@router.post(
    "",
    response_model=MenuActionPermissionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_permission_to_menu_action(
    payload: MenuActionPermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.menu_action_permission.assign")
    ),
):
    service = MenuActionPermissionService(db)
    return await service.assign_permission_to_menu_action(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{menu_action_permission_id}",
    response_model=MenuActionPermissionMessageResponse,
)
async def remove_menu_action_permission(
    menu_action_permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.menu_action_permission.remove")
    ),
):
    service = MenuActionPermissionService(db)
    return await service.remove_menu_action_permission(
        menu_action_permission_id=menu_action_permission_id,
        updated_by=current_user.user_id,
    )