# E:\Audit\AMS\backend\app\services\user\user_service.py

from math import ceil

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    async def list_users(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ):
        users, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            is_superuser=is_superuser,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": users,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_user(self, user_id: int):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        return user

    async def create_user(
        self,
        payload: UserCreate,
        created_by: str,
    ):
        existing_user = await self.repository.get_by_user_id_any_status(
            payload.user_id
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID already exists.",
            )

        if payload.email:
            existing_email = await self.repository.get_by_email_any_status(
                payload.email
            )

            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists.",
                )

        user = await self.repository.create_user(
            user_id=payload.user_id,
            full_name=payload.full_name,
            email=str(payload.email) if payload.email else None,
            hashed_password=self.hash_password(payload.password),
            is_superuser=payload.is_superuser,
            created_by=created_by,
        )

        return {
            "message": "User created successfully.",
            "data": user,
        }

    async def update_user(
        self,
        user_id: int,
        payload: UserUpdate,
        current_user_id: int,
        updated_by: str,
    ):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "user_id" in update_data:
            existing_user = await self.repository.get_by_user_id_any_status(
                update_data["user_id"]
            )

            if existing_user and existing_user.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User ID already exists.",
                )

        if "email" in update_data and update_data["email"]:
            existing_email = await self.repository.get_by_email_any_status(
                update_data["email"]
            )

            if existing_email and existing_email.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists.",
                )

            update_data["email"] = str(update_data["email"])

        if "password" in update_data:
            update_data["hashed_password"] = self.hash_password(
                update_data.pop("password")
            )

        if user.id == current_user_id and update_data.get("is_active") is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account.",
            )

        if user.id == current_user_id and update_data.get("is_superuser") is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove your own superuser access.",
            )

        if (
            user.is_superuser
            and update_data.get("is_superuser") is False
            and await self.repository.count_active_superusers() <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one active superuser must remain.",
            )

        if (
            user.is_superuser
            and update_data.get("is_active") is False
            and await self.repository.count_active_superusers() <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one active superuser must remain.",
            )

        updated_user = await self.repository.update(
            user=user,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "User updated successfully.",
            "data": updated_user,
        }

    async def deactivate_user(
        self,
        user_id: int,
        current_user_id: int,
        updated_by: str,
    ):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already inactive.",
            )

        if user.id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account.",
            )

        if user.is_superuser and await self.repository.count_active_superusers() <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one active superuser must remain.",
            )

        updated_user = await self.repository.deactivate(
            user=user,
            updated_by=updated_by,
        )

        return {
            "message": "User deactivated successfully.",
            "data": updated_user,
        }

    async def restore_user(
        self,
        user_id: int,
        updated_by: str,
    ):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already active.",
            )

        updated_user = await self.repository.restore(
            user=user,
            updated_by=updated_by,
        )

        return {
            "message": "User restored successfully.",
            "data": updated_user,
        }