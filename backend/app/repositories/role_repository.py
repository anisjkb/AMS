from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole

class RoleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ) -> tuple[list[Role], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Role.role_name.ilike(search_text),
                    Role.description.ilike(search_text),
                )
            )

        if is_active is not None:
            conditions.append(Role.is_active == is_active)

        count_stmt = select(func.count()).select_from(Role)
        query = select(Role)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": Role.id,
            "role_name": Role.role_name,
            "is_active": Role.is_active,
            "created_at": Role.created_at,
            "updated_at": Role.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Role.id)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        roles = list(result.scalars().all())

        return roles, total

    async def get_by_id(self, role_id: int) -> Role | None:
        result = await self.db.execute(
            select(Role).where(Role.id == role_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, role_name: str) -> Role | None:
        result = await self.db.execute(
            select(Role).where(
                func.lower(Role.role_name) == role_name.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        role_name: str,
        description: str | None,
        created_by: str,
    ) -> Role:
        role = Role(
            role_name=role_name,
            description=description,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(role)
        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def update(
        self,
        role: Role,
        role_name: str | None,
        description: str | None,
        updated_by: str,
    ) -> Role:
        if role_name is not None:
            role.role_name = role_name

        role.description = description
        role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def deactivate(
        self,
        role: Role,
        updated_by: str,
    ) -> Role:
        role.is_active = False
        role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def restore(
        self,
        role: Role,
        updated_by: str,
    ) -> Role:
        role.is_active = True
        role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def count_user_roles(self, role_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(UserRole).where(
                UserRole.role_id == role_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_role_permissions(self, role_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(RolePermission).where(
                RolePermission.role_id == role_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, role: Role) -> None:
        await self.db.delete(role)
        await self.db.commit()