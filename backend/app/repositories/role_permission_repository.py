
# E:\Audit\AMS\backend\app\repositories\role_permission_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission

class RolePermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_role_by_id(self, role_id: int) -> Role | None:
        result = await self.db.execute(
            select(Role).where(
                Role.id == role_id,
                Role.is_active == True,  # noqa: E712
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

    async def get_role_permission_by_id(
        self,
        role_permission_id: int,
    ) -> RolePermission | None:
        result = await self.db.execute(
            select(RolePermission).where(
                RolePermission.id == role_permission_id,
                RolePermission.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_existing_role_permission(
        self,
        role_id: int,
        permission_id: int,
    ) -> RolePermission | None:
        result = await self.db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_id,
                RolePermission.permission_id == permission_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_active_by_role_id(self, role_id: int) -> list[dict]:
        result = await self.db.execute(
            select(RolePermission, Role, Permission)
            .join(Role, Role.id == RolePermission.role_id)
            .join(Permission, Permission.id == RolePermission.permission_id)
            .where(
                RolePermission.role_id == role_id,
                RolePermission.is_active == True,  # noqa: E712
            )
            .order_by(Permission.resource_type.asc(), Permission.permission_key.asc())
        )

        rows = result.all()

        return [
            self.to_response_dict(
                role_permission=role_permission,
                role=role,
                permission=permission,
            )
            for role_permission, role, permission in rows
        ]

    async def assign(
        self,
        role: Role,
        permission: Permission,
        created_by: str | None,
    ) -> dict:
        existing_role_permission = await self.get_existing_role_permission(
            role_id=role.id,
            permission_id=permission.id,
        )

        if existing_role_permission:
            existing_role_permission.is_active = True
            existing_role_permission.updated_by = created_by

            await self.db.commit()
            await self.db.refresh(existing_role_permission)

            return self.to_response_dict(
                role_permission=existing_role_permission,
                role=role,
                permission=permission,
            )

        role_permission = RolePermission(
            role_id=role.id,
            permission_id=permission.id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(role_permission)
        await self.db.commit()
        await self.db.refresh(role_permission)

        return self.to_response_dict(
            role_permission=role_permission,
            role=role,
            permission=permission,
        )

    async def remove(
        self,
        role_permission: RolePermission,
        updated_by: str | None,
    ) -> dict:
        role_permission.is_active = False
        role_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role_permission)

        role = await self.get_role_by_id(role_permission.role_id)
        permission = await self.get_permission_by_id(role_permission.permission_id)

        return self.to_response_dict(
            role_permission=role_permission,
            role=role,
            permission=permission,
        )

    def to_response_dict(
        self,
        role_permission: RolePermission,
        role: Role | None,
        permission: Permission | None,
    ) -> dict:
        return {
            "id": role_permission.id,
            "role_id": role_permission.role_id,
            "permission_id": role_permission.permission_id,
            "is_active": role_permission.is_active,
            "role_name": role.role_name if role else None,
            "role_description": role.description if role else None,
            "permission_key": permission.permission_key if permission else None,
            "resource_type": permission.resource_type if permission else None,
            "resource_key": permission.resource_key if permission else None,
            "action": permission.action if permission else None,
            "description": permission.description if permission else None,
            "created_by": role_permission.created_by,
            "updated_by": role_permission.updated_by,
            "created_at": role_permission.created_at,
            "updated_at": role_permission.updated_at,
        }