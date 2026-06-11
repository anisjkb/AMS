import asyncio

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository


async def create_super_admin():
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)

        existing_user = await repo.get_by_user_id(settings.SUPER_ADMIN_USER_ID)

        if existing_user:
            print("Super admin already exists.")
            return

        await repo.create_user(
            user_id=settings.SUPER_ADMIN_USER_ID,
            email=settings.SUPER_ADMIN_EMAIL,
            full_name=settings.SUPER_ADMIN_FULL_NAME,
            hashed_password=hash_password(settings.SUPER_ADMIN_PASSWORD),
            is_superuser=True,
        )

        print("Super admin created successfully.")


if __name__ == "__main__":
    asyncio.run(create_super_admin())
