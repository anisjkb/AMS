# E:\Audit\AMS\backend\app\services\menu\menu_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_repository import MenuRepository
from app.repositories.navigation_group_repository import NavigationGroupRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.menu import MenuCreate, MenuUpdate


class MenuService:
    def __init__(self, db: AsyncSession):
        self.repository = MenuRepository(db)
        self.navigation_group_repository = NavigationGroupRepository(db)
        self.permission_repository = PermissionRepository(db)

    async def _validate_navigation_group(
        self,
        navigation_group_id: int | None,
    ) -> None:
        if navigation_group_id is None:
            return

        group = await self.navigation_group_repository.get_by_id(
            navigation_group_id
        )

        if not group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group not found or inactive.",
            )

    async def _validate_permission_key(self, permission_key: str | None) -> None:
        if permission_key is None:
            return

        permission = await self.permission_repository.get_by_key(permission_key)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu permission key does not exist.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu permission key is inactive.",
            )

    async def _validate_parent_menu(
        self,
        parent_menu_id: int | None,
        current_menu_id: int | None = None,
    ) -> None:
        if parent_menu_id is None:
            return

        if current_menu_id is not None and parent_menu_id == current_menu_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu cannot be its own parent.",
            )

        parent_menu = await self.repository.get_by_id(parent_menu_id)

        if not parent_menu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent menu not found or inactive.",
            )

        if current_menu_id is None:
            return

        current_parent_id = parent_menu.parent_menu_id

        while current_parent_id is not None:
            if current_parent_id == current_menu_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent menu. This would create a menu cycle.",
                )

            parent = await self.repository.get_by_id_any_status(current_parent_id)

            if not parent:
                break

            current_parent_id = parent.parent_menu_id

    async def list_menus(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        navigation_group_id: int | None = None,
        parent_menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ):
        items, total = await self.repository.list_paginated(
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

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_menu(self, menu_id: int):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        return menu

    async def create_menu(
        self,
        payload: MenuCreate,
        created_by: str,
    ):
        existing_menu = await self.repository.get_by_key(payload.menu_key)

        if existing_menu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu key already exists.",
            )

        await self._validate_navigation_group(payload.navigation_group_id)
        await self._validate_parent_menu(payload.parent_menu_id)
        await self._validate_permission_key(payload.permission_key)

        data = payload.model_dump()

        menu = await self.repository.create(
            data=data,
            created_by=created_by,
        )

        return {
            "message": "Menu created successfully.",
            "data": menu,
        }

    async def update_menu(
        self,
        menu_id: int,
        payload: MenuUpdate,
        updated_by: str,
    ):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "menu_key" in update_data:
            existing_menu = await self.repository.get_by_key(
                update_data["menu_key"]
            )

            if existing_menu and existing_menu.id != menu.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Menu key already exists.",
                )

        if "navigation_group_id" in update_data:
            await self._validate_navigation_group(
                update_data["navigation_group_id"]
            )

        if "parent_menu_id" in update_data:
            await self._validate_parent_menu(
                parent_menu_id=update_data["parent_menu_id"],
                current_menu_id=menu.id,
            )

        if "permission_key" in update_data:
            await self._validate_permission_key(update_data["permission_key"])

        updated_menu = await self.repository.update(
            menu=menu,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Menu updated successfully.",
            "data": updated_menu,
        }

    async def deactivate_menu(
        self,
        menu_id: int,
        updated_by: str,
    ):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        if not menu.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu is already inactive.",
            )

        updated_menu = await self.repository.deactivate(
            menu=menu,
            updated_by=updated_by,
        )

        return {
            "message": "Menu deactivated successfully.",
            "data": updated_menu,
        }

    async def restore_menu(
        self,
        menu_id: int,
        updated_by: str,
    ):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        if menu.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu is already active.",
            )

        updated_menu = await self.repository.restore(
            menu=menu,
            updated_by=updated_by,
        )

        return {
            "message": "Menu restored successfully.",
            "data": updated_menu,
        }

    async def permanent_delete_menu(self, menu_id: int):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        child_menu_count = await self.repository.count_child_menus(menu_id)
        menu_action_count = await self.repository.count_menu_actions(menu_id)
        menu_permission_count = await self.repository.count_menu_permissions(menu_id)

        if child_menu_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu has child menu(s). Remove them first.",
            )

        if menu_action_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu has menu action(s). Remove actions first.",
            )

        if menu_permission_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu has permission mapping(s). Remove mappings first.",
            )

        await self.repository.permanent_delete(menu)

        return {
            "message": "Menu permanently deleted successfully.",
            "data": None,
        }