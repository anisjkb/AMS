
# E:\Audit\AMS\backend\app\api\v1\menu_permissions.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu_permission import (
    MenuPermissionCreate,
    MenuPermissionMenuResponse,
    MenuPermissionMessageResponse,
    MenuPermissionResponse,
)
from app.services.menu_permission.menu_permission_service import (
    MenuPermissionService,
)

router = APIRouter(prefix="/menu-permissions", tags=["Menu Permissions"])


@router.get(
    "/menus",
    response_model=list[MenuPermissionMenuResponse],
)
async def list_active_menus_for_mapping(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu_permission.view")),
):
    service = MenuPermissionService(db)
    return await service.list_active_menus()


@router.get(
    "/menus/{menu_id}/permissions",
    response_model=list[MenuPermissionResponse],
)
async def list_permissions_by_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu_permission.view")),
):
    service = MenuPermissionService(db)
    return await service.list_permissions_by_menu(menu_id)


@router.post(
    "",
    response_model=MenuPermissionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_permission_to_menu(
    payload: MenuPermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_permission.assign")),
):
    service = MenuPermissionService(db)
    return await service.assign_permission_to_menu(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{menu_permission_id}",
    response_model=MenuPermissionMessageResponse,
)
async def remove_menu_permission(
    menu_permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_permission.remove")),
):
    service = MenuPermissionService(db)
    return await service.remove_menu_permission(
        menu_permission_id=menu_permission_id,
        updated_by=current_user.user_id,
    )