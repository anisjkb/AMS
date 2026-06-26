
# E:\Audit\AMS\backend\app\repositories\menu_action_permission_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission
from app.models.permission import Permission


class MenuActionPermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_active_menu_actions(self) -> list[dict]:
        result = await self.db.execute(
            select(MenuAction, Menu)
            .join(Menu, Menu.id == MenuAction.menu_id)
            .where(
                MenuAction.is_active == True,  # noqa: E712
                MenuAction.is_visible == True,  # noqa: E712
                Menu.is_active == True,  # noqa: E712
                Menu.is_visible == True,  # noqa: E712
            )
            .order_by(Menu.sort_order.asc(), MenuAction.sort_order.asc())
        )

        rows = result.all()

        return [
            self.to_action_lookup_dict(
                menu_action=menu_action,
                menu=menu,
            )
            for menu_action, menu in rows
        ]

    async def get_menu_action_by_id(
        self,
        menu_action_id: int,
    ) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(
                MenuAction.id == menu_action_id,
                MenuAction.is_active == True,  # noqa: E712
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

    async def get_menu_action_permission_by_id(
        self,
        menu_action_permission_id: int,
    ) -> MenuActionPermission | None:
        result = await self.db.execute(
            select(MenuActionPermission).where(
                MenuActionPermission.id == menu_action_permission_id,
                MenuActionPermission.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_existing_menu_action_permission(
        self,
        menu_action_id: int,
        permission_id: int,
    ) -> MenuActionPermission | None:
        result = await self.db.execute(
            select(MenuActionPermission).where(
                MenuActionPermission.menu_action_id == menu_action_id,
                MenuActionPermission.permission_id == permission_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_active_by_menu_action_id(
        self,
        menu_action_id: int,
    ) -> list[dict]:
        result = await self.db.execute(
            select(MenuActionPermission, MenuAction, Menu, Permission)
            .join(MenuAction, MenuAction.id == MenuActionPermission.menu_action_id)
            .join(Menu, Menu.id == MenuAction.menu_id)
            .join(Permission, Permission.id == MenuActionPermission.permission_id)
            .where(
                MenuActionPermission.menu_action_id == menu_action_id,
                MenuActionPermission.is_active == True,  # noqa: E712
            )
            .order_by(Permission.resource_type.asc(), Permission.permission_key.asc())
        )

        rows = result.all()

        return [
            self.to_response_dict(
                menu_action_permission=menu_action_permission,
                menu_action=menu_action,
                menu=menu,
                permission=permission,
            )
            for menu_action_permission, menu_action, menu, permission in rows
        ]

    async def assign(
        self,
        menu_action: MenuAction,
        permission: Permission,
        created_by: str | None,
    ) -> dict:
        existing_mapping = await self.get_existing_menu_action_permission(
            menu_action_id=menu_action.id,
            permission_id=permission.id,
        )

        if existing_mapping:
            existing_mapping.is_active = True
            existing_mapping.updated_by = created_by

            await self.db.commit()
            await self.db.refresh(existing_mapping)

            menu = await self.get_menu_by_id(menu_action.menu_id)

            return self.to_response_dict(
                menu_action_permission=existing_mapping,
                menu_action=menu_action,
                menu=menu,
                permission=permission,
            )

        mapping = MenuActionPermission(
            menu_action_id=menu_action.id,
            permission_id=permission.id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(mapping)
        await self.db.commit()
        await self.db.refresh(mapping)

        menu = await self.get_menu_by_id(menu_action.menu_id)

        return self.to_response_dict(
            menu_action_permission=mapping,
            menu_action=menu_action,
            menu=menu,
            permission=permission,
        )

    async def remove(
        self,
        menu_action_permission: MenuActionPermission,
        updated_by: str | None,
    ) -> dict:
        menu_action_permission.is_active = False
        menu_action_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu_action_permission)

        menu_action = await self.get_menu_action_by_id(
            menu_action_permission.menu_action_id
        )
        permission = await self.get_permission_by_id(
            menu_action_permission.permission_id
        )
        menu = await self.get_menu_by_id(menu_action.menu_id) if menu_action else None

        return self.to_response_dict(
            menu_action_permission=menu_action_permission,
            menu_action=menu_action,
            menu=menu,
            permission=permission,
        )

    async def get_menu_by_id(self, menu_id: int) -> Menu | None:
        result = await self.db.execute(select(Menu).where(Menu.id == menu_id))
        return result.scalar_one_or_none()

    def to_action_lookup_dict(
        self,
        menu_action: MenuAction,
        menu: Menu | None,
    ) -> dict:
        return {
            "id": menu_action.id,
            "menu_id": menu_action.menu_id,
            "menu_key": menu.menu_key if menu else None,
            "menu_title": menu.menu_title if menu else None,
            "action_key": menu_action.action_key,
            "action_title": menu_action.action_title,
            "permission_key": menu_action.permission_key,
            "button_color": menu_action.button_color,
            "button_icon": menu_action.button_icon,
            "sort_order": menu_action.sort_order,
            "is_active": menu_action.is_active,
            "is_visible": menu_action.is_visible,
        }

    def to_response_dict(
        self,
        menu_action_permission: MenuActionPermission,
        menu_action: MenuAction | None,
        menu: Menu | None,
        permission: Permission | None,
    ) -> dict:
        return {
            "id": menu_action_permission.id,
            "menu_action_id": menu_action_permission.menu_action_id,
            "permission_id": menu_action_permission.permission_id,
            "is_active": menu_action_permission.is_active,
            "menu_id": menu_action.menu_id if menu_action else None,
            "menu_key": menu.menu_key if menu else None,
            "menu_title": menu.menu_title if menu else None,
            "action_key": menu_action.action_key if menu_action else None,
            "action_title": menu_action.action_title if menu_action else None,
            "action_permission_key": (
                menu_action.permission_key if menu_action else None
            ),
            "permission_key": permission.permission_key if permission else None,
            "resource_type": permission.resource_type if permission else None,
            "resource_key": permission.resource_key if permission else None,
            "action": permission.action if permission else None,
            "description": permission.description if permission else None,
            "created_by": menu_action_permission.created_by,
            "updated_by": menu_action_permission.updated_by,
            "created_at": menu_action_permission.created_at,
            "updated_at": menu_action_permission.updated_at,
        }