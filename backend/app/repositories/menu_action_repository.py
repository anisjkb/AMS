
# E:\Audit\AMS\backend\app\repositories\menu_action_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission


class MenuActionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ) -> tuple[list[MenuAction], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    MenuAction.action_key.ilike(search_text),
                    MenuAction.action_title.ilike(search_text),
                    MenuAction.permission_key.ilike(search_text),
                    MenuAction.button_color.ilike(search_text),
                    MenuAction.button_icon.ilike(search_text),
                )
            )

        if menu_id is not None:
            conditions.append(MenuAction.menu_id == menu_id)

        if is_visible is not None:
            conditions.append(MenuAction.is_visible == is_visible)

        if is_active is not None:
            conditions.append(MenuAction.is_active == is_active)

        count_stmt = select(func.count()).select_from(MenuAction)
        query = select(MenuAction)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": MenuAction.id,
            "menu_id": MenuAction.menu_id,
            "action_key": MenuAction.action_key,
            "action_title": MenuAction.action_title,
            "sort_order": MenuAction.sort_order,
            "is_visible": MenuAction.is_visible,
            "is_active": MenuAction.is_active,
            "created_at": MenuAction.created_at,
            "updated_at": MenuAction.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, MenuAction.sort_order)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression, MenuAction.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, action_id: int) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(
                MenuAction.id == action_id,
                MenuAction.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, action_id: int) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(MenuAction.id == action_id)
        )
        return result.scalar_one_or_none()

    async def get_by_menu_and_action_key(
        self,
        menu_id: int,
        action_key: str,
    ) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(
                MenuAction.menu_id == menu_id,
                func.lower(MenuAction.action_key) == action_key.strip().lower(),
            )
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict, created_by: str) -> MenuAction:
        action = MenuAction(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(action)
        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def update(
        self,
        action: MenuAction,
        update_data: dict,
        updated_by: str,
    ) -> MenuAction:
        for field, value in update_data.items():
            setattr(action, field, value)

        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def deactivate(self, action: MenuAction, updated_by: str) -> MenuAction:
        action.is_active = False
        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def restore(self, action: MenuAction, updated_by: str) -> MenuAction:
        action.is_active = True
        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def count_menu_action_permissions(self, action_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuActionPermission).where(
                MenuActionPermission.menu_action_id == action_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, action: MenuAction) -> None:
        await self.db.delete(action)
        await self.db.commit()