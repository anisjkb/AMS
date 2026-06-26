# E:\Audit\AMS\backend\app\repositories\menu_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_permission import MenuPermission


class MenuRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
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
    ) -> tuple[list[Menu], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Menu.menu_key.ilike(search_text),
                    Menu.menu_title.ilike(search_text),
                    Menu.route_path.ilike(search_text),
                    Menu.icon.ilike(search_text),
                    Menu.permission_key.ilike(search_text),
                )
            )

        if navigation_group_id is not None:
            conditions.append(Menu.navigation_group_id == navigation_group_id)

        if parent_menu_id is not None:
            conditions.append(Menu.parent_menu_id == parent_menu_id)

        if is_visible is not None:
            conditions.append(Menu.is_visible == is_visible)

        if is_active is not None:
            conditions.append(Menu.is_active == is_active)

        count_stmt = select(func.count()).select_from(Menu)
        query = select(Menu)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": Menu.id,
            "menu_key": Menu.menu_key,
            "menu_title": Menu.menu_title,
            "sort_order": Menu.sort_order,
            "menu_level": Menu.menu_level,
            "is_visible": Menu.is_visible,
            "is_active": Menu.is_active,
            "created_at": Menu.created_at,
            "updated_at": Menu.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Menu.sort_order)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression, Menu.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, menu_id: int) -> Menu | None:
        result = await self.db.execute(
            select(Menu).where(
                Menu.id == menu_id,
                Menu.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, menu_id: int) -> Menu | None:
        result = await self.db.execute(select(Menu).where(Menu.id == menu_id))
        return result.scalar_one_or_none()

    async def get_by_key(self, menu_key: str) -> Menu | None:
        result = await self.db.execute(
            select(Menu).where(
                func.lower(Menu.menu_key) == menu_key.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict, created_by: str) -> Menu:
        menu = Menu(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(menu)
        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def update(
        self,
        menu: Menu,
        update_data: dict,
        updated_by: str,
    ) -> Menu:
        for field, value in update_data.items():
            setattr(menu, field, value)

        menu.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def deactivate(self, menu: Menu, updated_by: str) -> Menu:
        menu.is_active = False
        menu.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def restore(self, menu: Menu, updated_by: str) -> Menu:
        menu.is_active = True
        menu.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def count_child_menus(self, menu_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Menu).where(
                Menu.parent_menu_id == menu_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menu_actions(self, menu_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuAction).where(
                MenuAction.menu_id == menu_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menu_permissions(self, menu_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuPermission).where(
                MenuPermission.menu_id == menu_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, menu: Menu) -> None:
        await self.db.delete(menu)
        await self.db.commit()