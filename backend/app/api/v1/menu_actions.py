
# E:\Audit\AMS\backend\app\api\v1\menu_actions.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu_action import (
    MenuActionCreate,
    MenuActionListResponse,
    MenuActionMessageResponse,
    MenuActionResponse,
    MenuActionUpdate,
)
from app.services.menu_action.menu_action_service import MenuActionService

router = APIRouter(prefix="/menu-actions", tags=["Menu Actions"])


@router.get("", response_model=MenuActionListResponse)
async def list_menu_actions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    menu_id: int | None = None,
    is_visible: bool | None = None,
    is_active: bool | None = None,
    sort_by: str = "sort_order",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu_action.view")),
):
    service = MenuActionService(db)
    return await service.list_menu_actions(
        page=page,
        page_size=page_size,
        search=search,
        menu_id=menu_id,
        is_visible=is_visible,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{action_id}", response_model=MenuActionResponse)
async def get_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu_action.view")),
):
    service = MenuActionService(db)
    return await service.get_menu_action(action_id)


@router.post(
    "",
    response_model=MenuActionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_menu_action(
    payload: MenuActionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.create")),
):
    service = MenuActionService(db)
    return await service.create_menu_action(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{action_id}", response_model=MenuActionMessageResponse)
async def update_menu_action(
    action_id: int,
    payload: MenuActionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.update")),
):
    service = MenuActionService(db)
    return await service.update_menu_action(
        action_id=action_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{action_id}", response_model=MenuActionMessageResponse)
async def delete_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.delete")),
):
    service = MenuActionService(db)
    return await service.deactivate_menu_action(
        action_id=action_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{action_id}/restore", response_model=MenuActionMessageResponse)
async def restore_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.restore")),
):
    service = MenuActionService(db)
    return await service.restore_menu_action(
        action_id=action_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{action_id}/permanent", response_model=MenuActionMessageResponse)
async def permanent_delete_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.menu_action.permanent_delete")
    ),
):
    service = MenuActionService(db)
    return await service.permanent_delete_menu_action(action_id)