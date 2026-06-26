# E:\Audit\AMS\backend\app\repositories\user_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ) -> tuple[list[User], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    User.user_id.ilike(search_text),
                    User.full_name.ilike(search_text),
                    User.email.ilike(search_text),
                )
            )

        if is_active is not None:
            conditions.append(User.is_active == is_active)

        if is_superuser is not None:
            conditions.append(User.is_superuser == is_superuser)

        count_stmt = select(func.count()).select_from(User)
        query = select(User)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": User.id,
            "user_id": User.user_id,
            "full_name": User.full_name,
            "email": User.email,
            "is_active": User.is_active,
            "is_superuser": User.is_superuser,
            "created_at": User.created_at,
            "updated_at": User.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, User.id)
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
        users = list(result.scalars().all())

        return users, total

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
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

    async def get_by_user_id_any_status(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                func.lower(User.user_id) == user_id.strip().lower()
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

    async def get_by_email_any_status(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                func.lower(User.email) == email.strip().lower()
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

    async def update(
        self,
        user: User,
        update_data: dict,
        updated_by: str,
    ) -> User:
        for field, value in update_data.items():
            setattr(user, field, value)

        user.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def deactivate(
        self,
        user: User,
        updated_by: str,
    ) -> User:
        user.is_active = False
        user.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def restore(
        self,
        user: User,
        updated_by: str,
    ) -> User:
        user.is_active = True
        user.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def count_active_superusers(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(User).where(
                User.is_superuser == True,  # noqa: E712
                User.is_active == True,  # noqa: E712
            )
        )
        return int(result.scalar_one() or 0)