
# E:\Audit\AMS\backend\app\repositories\permission_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu_action_permission import MenuActionPermission
from app.models.menu_permission import MenuPermission
from app.models.permission import Permission
from app.models.role_permission import RolePermission


class PermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        resource_type: str | None = None,
        resource_key: str | None = None,
        action: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ) -> tuple[list[Permission], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Permission.permission_key.ilike(search_text),
                    Permission.resource_type.ilike(search_text),
                    Permission.resource_key.ilike(search_text),
                    Permission.action.ilike(search_text),
                    Permission.description.ilike(search_text),
                )
            )

        if resource_type:
            conditions.append(Permission.resource_type == resource_type.strip())

        if resource_key:
            conditions.append(Permission.resource_key == resource_key.strip())

        if action:
            conditions.append(Permission.action == action.strip())

        if is_active is not None:
            conditions.append(Permission.is_active == is_active)

        count_stmt = select(func.count()).select_from(Permission)
        query = select(Permission)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": Permission.id,
            "permission_key": Permission.permission_key,
            "resource_type": Permission.resource_type,
            "resource_key": Permission.resource_key,
            "action": Permission.action,
            "is_active": Permission.is_active,
            "created_at": Permission.created_at,
            "updated_at": Permission.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Permission.id)
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
        permissions = list(result.scalars().all())

        return permissions, total

    async def get_by_id(self, permission_id: int) -> Permission | None:
        result = await self.db.execute(
            select(Permission).where(Permission.id == permission_id)
        )
        return result.scalar_one_or_none()

    async def get_by_key(self, permission_key: str) -> Permission | None:
        result = await self.db.execute(
            select(Permission).where(
                func.lower(Permission.permission_key)
                == permission_key.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        permission_key: str,
        resource_type: str,
        resource_key: str,
        action: str,
        description: str | None,
        created_by: str,
    ) -> Permission:
        permission = Permission(
            permission_key=permission_key,
            resource_type=resource_type,
            resource_key=resource_key,
            action=action,
            description=description,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(permission)
        await self.db.commit()
        await self.db.refresh(permission)

        return permission

    async def update(
        self,
        permission: Permission,
        update_data: dict,
        updated_by: str,
    ) -> Permission:
        for field, value in update_data.items():
            setattr(permission, field, value)

        permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(permission)

        return permission

    async def deactivate(
        self,
        permission: Permission,
        updated_by: str,
    ) -> Permission:
        permission.is_active = False
        permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(permission)

        return permission

    async def restore(
        self,
        permission: Permission,
        updated_by: str,
    ) -> Permission:
        permission.is_active = True
        permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(permission)

        return permission

    async def count_role_permissions(self, permission_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(RolePermission).where(
                RolePermission.permission_id == permission_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menu_permissions(self, permission_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuPermission).where(
                MenuPermission.permission_id == permission_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menu_action_permissions(self, permission_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuActionPermission).where(
                MenuActionPermission.permission_id == permission_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, permission: Permission) -> None:
        await self.db.delete(permission)
        await self.db.commit()