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

    async def list_employee_options(
        self,
        employee_type: str | None = None,
    ):
        employee_types = (
            await self.repository.list_available_employee_types()
        )

        normalized_type = (
            employee_type.strip()
            if employee_type
            else None
        )

        employees = []

        if normalized_type:
            employees = (
                await self.repository.list_available_employee_options(
                    normalized_type
                )
            )

        items = []

        for employee in employees:
            blocking_reasons = []

            official_employee_id = str(
                employee.official_employee_id or ""
            ).strip()

            employee_email = str(
                employee.email or ""
            ).strip()

            if not official_employee_id:
                blocking_reasons.append(
                    "Create the Official Employee ID "
                    "in Employee Master first."
                )

            if not employee_email:
                blocking_reasons.append(
                    "Add the Employee email address "
                    "in Employee Master first."
                )

            items.append(
                {
                    "employee_id": employee.id,
                    "employee_type": employee.employee_type,
                    "employee_code": employee.employee_code,
                    "official_employee_id": (
                        official_employee_id or None
                    ),
                    "employee_name": employee.employee_name,
                    "email": employee_email or None,
                    "can_create_user": (
                        len(blocking_reasons) == 0
                    ),
                    "blocking_reason": (
                        " ".join(blocking_reasons)
                        if blocking_reasons
                        else None
                    ),
                }
            )

        return {
            "employee_types": employee_types,
            "items": items,
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
        employee = (
            await self.repository.get_employee_by_id_any_status(
                payload.employee_id
            )
        )

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected Employee was not found.",
            )

        if not employee.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Only an active Employee can be "
                    "linked to a User account."
                ),
            )

        official_employee_id = str(
            employee.official_employee_id or ""
        ).strip()

        if not official_employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The selected Employee does not have "
                    "an Official Employee ID. Update the "
                    "Employee record first."
                ),
            )

        employee_email = str(
            employee.email or ""
        ).strip()

        if not employee_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The selected Employee does not have "
                    "an email address. Update the Employee "
                    "record first."
                ),
            )

        linked_user = (
            await self.repository.get_by_employee_id_any_status(
                payload.employee_id
            )
        )

        if linked_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The selected Employee is already linked "
                    "to another User account."
                ),
            )

        existing_user = (
            await self.repository.get_by_user_id_any_status(
                payload.user_id
            )
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Login ID already exists.",
            )

        existing_email = (
            await self.repository.get_by_email_any_status(
                employee_email
            )
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The selected Employee email is already "
                    "used by another User account."
                ),
            )

        employee_name = str(
            employee.employee_name or ""
        ).strip()

        if not employee_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The selected Employee does not have "
                    "a valid Employee Name."
                ),
            )

        user = await self.repository.create_user(
            user_id=payload.user_id,
            employee_id=payload.employee_id,
            full_name=employee_name,
            email=employee_email,
            hashed_password=self.hash_password(
                payload.password
            ),
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
        user = await self.repository.get_by_id_any_status(
            user_id
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        update_data = payload.model_dump(
            exclude_unset=True,
            exclude_none=True,
        )

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "password" in update_data:
            update_data["hashed_password"] = (
                self.hash_password(
                    update_data.pop("password")
                )
            )

        if (
            user.id == current_user_id
            and update_data.get("is_active") is False
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You cannot deactivate your own account."
                ),
            )

        if (
            user.id == current_user_id
            and update_data.get("is_superuser") is False
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You cannot remove your own "
                    "superuser access."
                ),
            )

        active_superuser_count = None

        if (
            user.is_superuser
            and (
                update_data.get("is_superuser") is False
                or update_data.get("is_active") is False
            )
        ):
            active_superuser_count = (
                await self.repository.count_active_superusers()
            )

        if (
            user.is_superuser
            and update_data.get("is_superuser") is False
            and active_superuser_count is not None
            and active_superuser_count <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "At least one active superuser "
                    "must remain."
                ),
            )

        if (
            user.is_superuser
            and update_data.get("is_active") is False
            and active_superuser_count is not None
            and active_superuser_count <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "At least one active superuser "
                    "must remain."
                ),
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