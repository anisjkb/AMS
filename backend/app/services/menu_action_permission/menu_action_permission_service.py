
# E:\Audit\AMS\backend\app\services\menu_action_permission\menu_action_permission_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_action_permission_repository import (
    MenuActionPermissionRepository,
)
from app.schemas.menu_action_permission import MenuActionPermissionCreate


class MenuActionPermissionService:
    def __init__(self, db: AsyncSession):
        self.repo = MenuActionPermissionRepository(db)

    async def list_active_menu_actions(self) -> list[dict]:
        return await self.repo.list_active_menu_actions()

    async def list_permissions_by_menu_action(
        self,
        menu_action_id: int,
    ) -> list[dict]:
        menu_action = await self.repo.get_menu_action_by_id(menu_action_id)

        if not menu_action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        return await self.repo.list_active_by_menu_action_id(menu_action_id)

    async def assign_permission_to_menu_action(
        self,
        payload: MenuActionPermissionCreate,
        created_by: str | None,
    ) -> dict:
        menu_action = await self.repo.get_menu_action_by_id(payload.menu_action_id)

        if not menu_action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        permission = await self.repo.get_permission_by_id(payload.permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        data = await self.repo.assign(
            menu_action=menu_action,
            permission=permission,
            created_by=created_by,
        )

        return {
            "message": "Permission assigned to menu action successfully.",
            "data": data,
        }

    async def remove_menu_action_permission(
        self,
        menu_action_permission_id: int,
        updated_by: str | None,
    ) -> dict:
        mapping = await self.repo.get_menu_action_permission_by_id(
            menu_action_permission_id
        )

        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action permission not found.",
            )

        data = await self.repo.remove(
            menu_action_permission=mapping,
            updated_by=updated_by,
        )

        return {
            "message": "Permission removed from menu action successfully.",
            "data": data,
        }