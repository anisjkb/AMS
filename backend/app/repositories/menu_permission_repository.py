
# E:\Audit\AMS\backend\app\repositories\menu_permission_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.menu_permission import MenuPermission
from app.models.permission import Permission


class MenuPermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_active_menus(self) -> list[Menu]:
        result = await self.db.execute(
            select(Menu)
            .where(
                Menu.is_active == True,  # noqa: E712
                Menu.is_visible == True,  # noqa: E712
                Menu.route_path.is_not(None),
            )
            .order_by(Menu.sort_order.asc(), Menu.menu_title.asc())
        )
        return list(result.scalars().all())

    async def get_menu_by_id(self, menu_id: int) -> Menu | None:
        result = await self.db.execute(
            select(Menu).where(
                Menu.id == menu_id,
                Menu.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_permission_by_id(self, permission_id: int) -> Permission | None:
        result = await self.db.execute(
            select(Permission).where(
                Permission.id == permission_id,
                Permission.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_menu_permission_by_id(
        self,
        menu_permission_id: int,
    ) -> MenuPermission | None:
        result = await self.db.execute(
            select(MenuPermission).where(
                MenuPermission.id == menu_permission_id,
                MenuPermission.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_existing_menu_permission(
        self,
        menu_id: int,
        permission_id: int,
    ) -> MenuPermission | None:
        result = await self.db.execute(
            select(MenuPermission).where(
                MenuPermission.menu_id == menu_id,
                MenuPermission.permission_id == permission_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_active_by_menu_id(self, menu_id: int) -> list[dict]:
        result = await self.db.execute(
            select(MenuPermission, Menu, Permission)
            .join(Menu, Menu.id == MenuPermission.menu_id)
            .join(Permission, Permission.id == MenuPermission.permission_id)
            .where(
                MenuPermission.menu_id == menu_id,
                MenuPermission.is_active == True,  # noqa: E712
            )
            .order_by(Permission.resource_type.asc(), Permission.permission_key.asc())
        )

        rows = result.all()

        return [
            self.to_response_dict(
                menu_permission=menu_permission,
                menu=menu,
                permission=permission,
            )
            for menu_permission, menu, permission in rows
        ]

    async def assign(
        self,
        menu: Menu,
        permission: Permission,
        created_by: str | None,
    ) -> dict:
        existing_menu_permission = await self.get_existing_menu_permission(
            menu_id=menu.id,
            permission_id=permission.id,
        )

        if existing_menu_permission:
            existing_menu_permission.is_active = True
            existing_menu_permission.updated_by = created_by

            await self.db.commit()
            await self.db.refresh(existing_menu_permission)

            return self.to_response_dict(
                menu_permission=existing_menu_permission,
                menu=menu,
                permission=permission,
            )

        menu_permission = MenuPermission(
            menu_id=menu.id,
            permission_id=permission.id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(menu_permission)
        await self.db.commit()
        await self.db.refresh(menu_permission)

        return self.to_response_dict(
            menu_permission=menu_permission,
            menu=menu,
            permission=permission,
        )

    async def remove(
        self,
        menu_permission: MenuPermission,
        updated_by: str | None,
    ) -> dict:
        menu_permission.is_active = False
        menu_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu_permission)

        menu = await self.get_menu_by_id(menu_permission.menu_id)
        permission = await self.get_permission_by_id(menu_permission.permission_id)

        return self.to_response_dict(
            menu_permission=menu_permission,
            menu=menu,
            permission=permission,
        )

    def to_menu_lookup_dict(self, menu: Menu) -> dict:
        return {
            "id": menu.id,
            "menu_key": menu.menu_key,
            "menu_title": menu.menu_title,
            "route_path": menu.route_path,
            "icon": menu.icon,
            "permission_key": menu.permission_key,
            "sort_order": menu.sort_order,
            "is_active": menu.is_active,
        }

    def to_response_dict(
        self,
        menu_permission: MenuPermission,
        menu: Menu | None,
        permission: Permission | None,
    ) -> dict:
        return {
            "id": menu_permission.id,
            "menu_id": menu_permission.menu_id,
            "permission_id": menu_permission.permission_id,
            "is_active": menu_permission.is_active,
            "menu_key": menu.menu_key if menu else None,
            "menu_title": menu.menu_title if menu else None,
            "route_path": menu.route_path if menu else None,
            "permission_key": permission.permission_key if permission else None,
            "resource_type": permission.resource_type if permission else None,
            "resource_key": permission.resource_key if permission else None,
            "action": permission.action if permission else None,
            "description": permission.description if permission else None,
            "created_by": menu_permission.created_by,
            "updated_by": menu_permission.updated_by,
            "created_at": menu_permission.created_at,
            "updated_at": menu_permission.updated_at,
        }