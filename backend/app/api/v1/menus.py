# E:\Audit\AMS\backend\app\api\v1\menus.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu import (
    MenuCreate,
    MenuListResponse,
    MenuMessageResponse,
    MenuResponse,
    MenuUpdate,
)
from app.services.menu.menu_service import MenuService

router = APIRouter(prefix="/menus", tags=["Menus"])


@router.get("", response_model=MenuListResponse)
async def list_menus(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    navigation_group_id: int | None = None,
    parent_menu_id: int | None = None,
    is_visible: bool | None = None,
    is_active: bool | None = None,
    sort_by: str = "sort_order",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu.view")),
):
    service = MenuService(db)
    return await service.list_menus(
        page=page,
        page_size=page_size,
        search=search,
        navigation_group_id=navigation_group_id,
        parent_menu_id=parent_menu_id,
        is_visible=is_visible,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{menu_id}", response_model=MenuResponse)
async def get_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu.view")),
):
    service = MenuService(db)
    return await service.get_menu(menu_id)


@router.post(
    "",
    response_model=MenuMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_menu(
    payload: MenuCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.create")),
):
    service = MenuService(db)
    return await service.create_menu(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{menu_id}", response_model=MenuMessageResponse)
async def update_menu(
    menu_id: int,
    payload: MenuUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.update")),
):
    service = MenuService(db)
    return await service.update_menu(
        menu_id=menu_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{menu_id}", response_model=MenuMessageResponse)
async def delete_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.delete")),
):
    service = MenuService(db)
    return await service.deactivate_menu(
        menu_id=menu_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{menu_id}/restore", response_model=MenuMessageResponse)
async def restore_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.restore")),
):
    service = MenuService(db)
    return await service.restore_menu(
        menu_id=menu_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{menu_id}/permanent", response_model=MenuMessageResponse)
async def permanent_delete_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.permanent_delete")),
):
    service = MenuService(db)
    return await service.permanent_delete_menu(menu_id)