
# E:\Audit\AMS\backend\app\repositories\navigation_group_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.navigation_group import NavigationGroup


class NavigationGroupRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        parent_group_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ) -> tuple[list[NavigationGroup], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    NavigationGroup.group_key.ilike(search_text),
                    NavigationGroup.group_title.ilike(search_text),
                    NavigationGroup.group_icon.ilike(search_text),
                    NavigationGroup.group_badge.ilike(search_text),
                    NavigationGroup.group_color.ilike(search_text),
                    NavigationGroup.group_permission_key.ilike(search_text),
                )
            )

        if parent_group_id is not None:
            conditions.append(NavigationGroup.parent_group_id == parent_group_id)

        if is_visible is not None:
            conditions.append(NavigationGroup.is_visible == is_visible)

        if is_active is not None:
            conditions.append(NavigationGroup.is_active == is_active)

        count_stmt = select(func.count()).select_from(NavigationGroup)
        query = select(NavigationGroup)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": NavigationGroup.id,
            "group_key": NavigationGroup.group_key,
            "group_title": NavigationGroup.group_title,
            "sort_order": NavigationGroup.sort_order,
            "is_visible": NavigationGroup.is_visible,
            "is_active": NavigationGroup.is_active,
            "created_at": NavigationGroup.created_at,
            "updated_at": NavigationGroup.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, NavigationGroup.sort_order)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression, NavigationGroup.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, group_id: int) -> NavigationGroup | None:
        result = await self.db.execute(
            select(NavigationGroup).where(
                NavigationGroup.id == group_id,
                NavigationGroup.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, group_id: int) -> NavigationGroup | None:
        result = await self.db.execute(
            select(NavigationGroup).where(NavigationGroup.id == group_id)
        )
        return result.scalar_one_or_none()

    async def get_by_key(self, group_key: str) -> NavigationGroup | None:
        result = await self.db.execute(
            select(NavigationGroup).where(
                func.lower(NavigationGroup.group_key) == group_key.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        data: dict,
        created_by: str,
    ) -> NavigationGroup:
        group = NavigationGroup(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(group)
        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def update(
        self,
        group: NavigationGroup,
        update_data: dict,
        updated_by: str,
    ) -> NavigationGroup:
        for field, value in update_data.items():
            setattr(group, field, value)

        group.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def deactivate(
        self,
        group: NavigationGroup,
        updated_by: str,
    ) -> NavigationGroup:
        group.is_active = False
        group.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def restore(
        self,
        group: NavigationGroup,
        updated_by: str,
    ) -> NavigationGroup:
        group.is_active = True
        group.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def count_child_groups(self, group_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(NavigationGroup).where(
                NavigationGroup.parent_group_id == group_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menus(self, group_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Menu).where(
                Menu.navigation_group_id == group_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, group: NavigationGroup) -> None:
        await self.db.delete(group)
        await self.db.commit()