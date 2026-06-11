from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_role import UserRole


class RBACRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_role_by_name(self, role_name: str) -> Role | None:
        result = await self.db.execute(
            select(Role).where(
                Role.role_name == role_name,
                Role.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def create_role(
        self,
        role_name: str,
        description: str | None = None,
        created_by: str | None = None,
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

    async def get_permission_by_key(self, permission_key: str) -> Permission | None:
        result = await self.db.execute(
            select(Permission).where(
                Permission.permission_key == permission_key,
                Permission.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def create_permission(
        self,
        permission_key: str,
        resource_type: str,
        resource_key: str,
        action: str,
        description: str | None = None,
        created_by: str | None = None,
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

    async def assign_role_to_user(
        self,
        user: User,
        role: Role,
        created_by: str | None = None,
    ) -> UserRole:
        existing = await self.db.execute(
            select(UserRole).where(
                UserRole.user_id == user.id,
                UserRole.role_id == role.id,
                UserRole.is_active == True,  # noqa: E712
            )
        )
        existing_user_role = existing.scalar_one_or_none()

        if existing_user_role:
            return existing_user_role

        user_role = UserRole(
            user_id=user.id,
            role_id=role.id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )
        self.db.add(user_role)
        await self.db.commit()
        await self.db.refresh(user_role)
        return user_role

    async def assign_permission_to_role(
        self,
        role: Role,
        permission: Permission,
        created_by: str | None = None,
    ) -> RolePermission:
        existing = await self.db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role.id,
                RolePermission.permission_id == permission.id,
                RolePermission.is_active == True,  # noqa: E712
            )
        )
        existing_role_permission = existing.scalar_one_or_none()

        if existing_role_permission:
            return existing_role_permission

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
        return role_permission

    async def user_has_permission(
        self,
        user_id,
        permission_key: str,
    ) -> bool:
        result = await self.db.execute(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                UserRole.is_active == True,  # noqa: E712
                Role.is_active == True,  # noqa: E712
                RolePermission.is_active == True,  # noqa: E712
                Permission.is_active == True,  # noqa: E712
                Permission.permission_key == permission_key,
            )
        )

        permission = result.scalar_one_or_none()
        return permission is not None
