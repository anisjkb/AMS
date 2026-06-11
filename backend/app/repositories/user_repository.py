import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.user_id == user_id,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.email == email,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def create_user(
        self,
        user_id: str,
        full_name: str,
        hashed_password: str,
        email: str | None = None,
        is_superuser: bool = False,
        created_by: str | None = None,
    ) -> User:
        user = User(
            user_id=user_id,
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            is_superuser=is_superuser,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
