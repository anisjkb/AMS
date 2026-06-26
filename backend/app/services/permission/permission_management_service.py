# E:\Audit\AMS\backend\app\services\permission\permission_management_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.permission_repository import PermissionRepository
from app.schemas.permission import PermissionCreate, PermissionUpdate


class PermissionManagementService:
    def __init__(self, db: AsyncSession):
        self.repository = PermissionRepository(db)

    async def list_permissions(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        resource_type: str | None = None,
        resource_key: str | None = None,
        action: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ):
        permissions, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            resource_type=resource_type,
            resource_key=resource_key,
            action=action,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": permissions,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_permission(self, permission_id: int):
        permission = await self.repository.get_by_id(permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        return permission

    async def create_permission(
        self,
        payload: PermissionCreate,
        created_by: str,
    ):
        existing_permission = await self.repository.get_by_key(
            payload.permission_key
        )

        if existing_permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission key already exists.",
            )

        permission = await self.repository.create(
            permission_key=payload.permission_key,
            resource_type=payload.resource_type,
            resource_key=payload.resource_key,
            action=payload.action,
            description=payload.description,
            created_by=created_by,
        )

        return {
            "message": "Permission created successfully.",
            "data": permission,
        }

    async def update_permission(
        self,
        permission_id: int,
        payload: PermissionUpdate,
        updated_by: str,
    ):
        permission = await self.repository.get_by_id(permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "permission_key" in update_data:
            existing_permission = await self.repository.get_by_key(
                update_data["permission_key"]
            )

            if existing_permission and existing_permission.id != permission.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Permission key already exists.",
                )

        updated_permission = await self.repository.update(
            permission=permission,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Permission updated successfully.",
            "data": updated_permission,
        }

    async def deactivate_permission(
        self,
        permission_id: int,
        updated_by: str,
    ):
        permission = await self.repository.get_by_id(permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission is already inactive.",
            )

        updated_permission = await self.repository.deactivate(
            permission=permission,
            updated_by=updated_by,
        )

        return {
            "message": "Permission deactivated successfully.",
            "data": updated_permission,
        }

    async def restore_permission(
        self,
        permission_id: int,
        updated_by: str,
    ):
        permission = await self.repository.get_by_id(permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        if permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Permission is already active.",
            )

        updated_permission = await self.repository.restore(
            permission=permission,
            updated_by=updated_by,
        )

        return {
            "message": "Permission restored successfully.",
            "data": updated_permission,
        }

    async def permanent_delete_permission(self, permission_id: int):
        permission = await self.repository.get_by_id(permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        role_permission_count = await self.repository.count_role_permissions(
            permission_id
        )
        menu_permission_count = await self.repository.count_menu_permissions(
            permission_id
        )
        menu_action_permission_count = (
            await self.repository.count_menu_action_permissions(permission_id)
        )

        if role_permission_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This permission is assigned to role(s). Remove role permission assignments first.",
            )

        if menu_permission_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This permission is assigned to menu(s). Remove menu permission assignments first.",
            )

        if menu_action_permission_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This permission is assigned to menu action(s). Remove menu action permission assignments first.",
            )

        await self.repository.permanent_delete(permission)

        return {
            "message": "Permission permanently deleted successfully.",
            "data": None,
        }