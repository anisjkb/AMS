# E:\Audit\AMS\backend\app\services\menu_action\menu_action_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_action_repository import MenuActionRepository
from app.repositories.menu_repository import MenuRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.menu_action import MenuActionCreate, MenuActionUpdate


class MenuActionService:
    def __init__(self, db: AsyncSession):
        self.repository = MenuActionRepository(db)
        self.menu_repository = MenuRepository(db)
        self.permission_repository = PermissionRepository(db)

    async def _validate_menu(self, menu_id: int) -> None:
        menu = await self.menu_repository.get_by_id(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu not found or inactive.",
            )

    async def _validate_permission_key(self, permission_key: str) -> None:
        permission = await self.permission_repository.get_by_key(permission_key)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action permission key does not exist.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action permission key is inactive.",
            )

    async def list_menu_actions(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ):
        items, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            menu_id=menu_id,
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

    async def get_menu_action(self, action_id: int):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        return action

    async def create_menu_action(
        self,
        payload: MenuActionCreate,
        created_by: str,
    ):
        await self._validate_menu(payload.menu_id)
        await self._validate_permission_key(payload.permission_key)

        existing_action = await self.repository.get_by_menu_and_action_key(
            menu_id=payload.menu_id,
            action_key=payload.action_key,
        )

        if existing_action:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action key already exists for this menu.",
            )

        action = await self.repository.create(
            data=payload.model_dump(),
            created_by=created_by,
        )

        return {
            "message": "Menu action created successfully.",
            "data": action,
        }

    async def update_menu_action(
        self,
        action_id: int,
        payload: MenuActionUpdate,
        updated_by: str,
    ):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        target_menu_id = update_data.get("menu_id", action.menu_id)
        target_action_key = update_data.get("action_key", action.action_key)

        if "menu_id" in update_data:
            await self._validate_menu(update_data["menu_id"])

        if "permission_key" in update_data:
            await self._validate_permission_key(update_data["permission_key"])

        if "menu_id" in update_data or "action_key" in update_data:
            existing_action = await self.repository.get_by_menu_and_action_key(
                menu_id=target_menu_id,
                action_key=target_action_key,
            )

            if existing_action and existing_action.id != action.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Action key already exists for this menu.",
                )

        updated_action = await self.repository.update(
            action=action,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Menu action updated successfully.",
            "data": updated_action,
        }

    async def deactivate_menu_action(self, action_id: int, updated_by: str):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        if not action.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action is already inactive.",
            )

        updated_action = await self.repository.deactivate(
            action=action,
            updated_by=updated_by,
        )

        return {
            "message": "Menu action deactivated successfully.",
            "data": updated_action,
        }

    async def restore_menu_action(self, action_id: int, updated_by: str):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        if action.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action is already active.",
            )

        updated_action = await self.repository.restore(
            action=action,
            updated_by=updated_by,
        )

        return {
            "message": "Menu action restored successfully.",
            "data": updated_action,
        }

    async def permanent_delete_menu_action(self, action_id: int):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        mapping_count = await self.repository.count_menu_action_permissions(action_id)

        if mapping_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu action has permission mapping(s). Remove mappings first.",
            )

        await self.repository.permanent_delete(action)

        return {
            "message": "Menu action permanently deleted successfully.",
            "data": None,
        }