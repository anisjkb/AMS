# E:\Audit\AMS\backend\app\services\role\role_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.role_repository import RoleRepository
from app.schemas.role import RoleCreate, RoleUpdate


class RoleService:
    def __init__(self, db: AsyncSession):
        self.repository = RoleRepository(db)

    async def list_roles(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ):
        roles, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": roles,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_role(self, role_id: int):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        return role

    async def create_role(
        self,
        payload: RoleCreate,
        created_by: str,
    ):
        existing_role = await self.repository.get_by_name(payload.role_name)

        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists.",
            )

        role = await self.repository.create(
            role_name=payload.role_name,
            description=payload.description,
            created_by=created_by,
        )

        return {
            "message": "Role created successfully.",
            "data": role,
        }

    async def update_role(
        self,
        role_id: int,
        payload: RoleUpdate,
        updated_by: str,
    ):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if payload.role_name is not None:
            existing_role = await self.repository.get_by_name(payload.role_name)

            if existing_role and existing_role.id != role.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Role name already exists.",
                )

        updated_role = await self.repository.update(
            role=role,
            role_name=payload.role_name,
            description=payload.description,
            updated_by=updated_by,
        )

        return {
            "message": "Role updated successfully.",
            "data": updated_role,
        }

    async def deactivate_role(
        self,
        role_id: int,
        updated_by: str,
    ):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if not role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is already inactive.",
            )

        updated_role = await self.repository.deactivate(
            role=role,
            updated_by=updated_by,
        )

        return {
            "message": "Role deactivated successfully.",
            "data": updated_role,
        }

    async def restore_role(
        self,
        role_id: int,
        updated_by: str,
    ):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is already active.",
            )

        updated_role = await self.repository.restore(
            role=role,
            updated_by=updated_by,
        )

        return {
            "message": "Role restored successfully.",
            "data": updated_role,
        }

    async def permanent_delete_role(self, role_id: int):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        user_role_count = await self.repository.count_user_roles(role_id)
        role_permission_count = await self.repository.count_role_permissions(role_id)

        if user_role_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role is assigned to user(s). Remove user role assignments first.",
            )

        if role_permission_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role has permission assignments. Remove role permissions first.",
            )

        await self.repository.permanent_delete(role)

        return {
            "message": "Role permanently deleted successfully.",
            "data": None,
        }