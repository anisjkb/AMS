
# E:\Audit\AMS\backend\app\repositories\user_role_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.models.user import User
from app.models.user_role import UserRole


class UserRoleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_role_by_id(self, role_id: int) -> Role | None:
        result = await self.db.execute(
            select(Role).where(
                Role.id == role_id,
                Role.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_user_role_by_id(self, user_role_id: int) -> UserRole | None:
        result = await self.db.execute(
            select(UserRole).where(
                UserRole.id == user_role_id,
                UserRole.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_existing_user_role(
        self,
        user_id: int,
        role_id: int,
    ) -> UserRole | None:
        result = await self.db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_active_by_user_id(self, user_id: int) -> list[dict]:
        result = await self.db.execute(
            select(UserRole, Role, User)
            .join(Role, Role.id == UserRole.role_id)
            .join(User, User.id == UserRole.user_id)
            .where(
                UserRole.user_id == user_id,
                UserRole.is_active == True,  # noqa: E712
            )
            .order_by(Role.role_name.asc())
        )

        rows = result.all()

        return [
            self.to_response_dict(
                user_role=user_role,
                role=role,
                user=user,
            )
            for user_role, role, user in rows
        ]

    async def assign(
        self,
        user: User,
        role: Role,
        created_by: str | None,
    ) -> dict:
        existing_user_role = await self.get_existing_user_role(
            user_id=user.id,
            role_id=role.id,
        )

        if existing_user_role:
            existing_user_role.is_active = True
            existing_user_role.updated_by = created_by

            await self.db.commit()
            await self.db.refresh(existing_user_role)

            return self.to_response_dict(
                user_role=existing_user_role,
                role=role,
                user=user,
            )

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

        return self.to_response_dict(
            user_role=user_role,
            role=role,
            user=user,
        )

    async def remove(
        self,
        user_role: UserRole,
        updated_by: str | None,
    ) -> dict:
        user_role.is_active = False
        user_role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user_role)

        role = await self.get_role_by_id(user_role.role_id)
        user = await self.get_user_by_id(user_role.user_id)

        return self.to_response_dict(
            user_role=user_role,
            role=role,
            user=user,
        )

    def to_response_dict(
        self,
        user_role: UserRole,
        role: Role | None,
        user: User | None,
    ) -> dict:
        return {
            "id": user_role.id,
            "user_id": user_role.user_id,
            "role_id": user_role.role_id,
            "is_active": user_role.is_active,
            "user_login_id": user.user_id if user else None,
            "user_full_name": user.full_name if user else None,
            "user_email": user.email if user else None,
            "role_name": role.role_name if role else None,
            "role_description": role.description if role else None,
            "created_by": user_role.created_by,
            "updated_by": user_role.updated_by,
            "created_at": user_role.created_at,
            "updated_at": user_role.updated_at,
        }