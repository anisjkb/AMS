
# E:\Audit\AMS\backend\app\services\menu_permission\menu_permission_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_permission_repository import MenuPermissionRepository
from app.schemas.menu_permission import MenuPermissionCreate


class MenuPermissionService:
    def __init__(self, db: AsyncSession):
        self.repo = MenuPermissionRepository(db)

    async def list_active_menus(self) -> list[dict]:
        menus = await self.repo.list_active_menus()
        return [self.repo.to_menu_lookup_dict(menu) for menu in menus]

    async def list_permissions_by_menu(self, menu_id: int) -> list[dict]:
        menu = await self.repo.get_menu_by_id(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        return await self.repo.list_active_by_menu_id(menu_id)

    async def assign_permission_to_menu(
        self,
        payload: MenuPermissionCreate,
        created_by: str | None,
    ) -> dict:
        menu = await self.repo.get_menu_by_id(payload.menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        permission = await self.repo.get_permission_by_id(payload.permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        data = await self.repo.assign(
            menu=menu,
            permission=permission,
            created_by=created_by,
        )

        return {
            "message": "Permission assigned to menu successfully.",
            "data": data,
        }

    async def remove_menu_permission(
        self,
        menu_permission_id: int,
        updated_by: str | None,
    ) -> dict:
        menu_permission = await self.repo.get_menu_permission_by_id(
            menu_permission_id
        )

        if not menu_permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu permission not found.",
            )

        data = await self.repo.remove(
            menu_permission=menu_permission,
            updated_by=updated_by,
        )

        return {
            "message": "Permission removed from menu successfully.",
            "data": data,
        }