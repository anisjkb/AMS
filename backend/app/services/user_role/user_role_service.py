# E:\Audit\AMS\backend\app\services\user_role\user_role_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_role_repository import UserRoleRepository
from app.schemas.user_role import UserRoleCreate


class UserRoleService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRoleRepository(db)

    async def list_roles_by_user(self, user_id: int) -> list[dict]:
        user = await self.repo.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        return await self.repo.list_active_by_user_id(user_id)

    async def assign_role_to_user(
        self,
        payload: UserRoleCreate,
        created_by: str | None,
    ) -> dict:
        user = await self.repo.get_user_by_id(payload.user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        role = await self.repo.get_role_by_id(payload.role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        data = await self.repo.assign(
            user=user,
            role=role,
            created_by=created_by,
        )

        return {
            "message": "Role assigned to user successfully.",
            "data": data,
        }

    async def remove_user_role(
        self,
        user_role_id: int,
        updated_by: str | None,
    ) -> dict:
        user_role = await self.repo.get_user_role_by_id(user_role_id)

        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User role not found.",
            )

        data = await self.repo.remove(
            user_role=user_role,
            updated_by=updated_by,
        )

        return {
            "message": "Role removed from user successfully.",
            "data": data,
        }