# E:\Audit\AMS\backend\app\services\navigation_group\navigation_group_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.navigation_group_repository import NavigationGroupRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.navigation_group import NavigationGroupCreate, NavigationGroupUpdate


class NavigationGroupService:
    def __init__(self, db: AsyncSession):
        self.repository = NavigationGroupRepository(db)
        self.permission_repository = PermissionRepository(db)

    async def _validate_permission_key(self, permission_key: str | None) -> None:
        if permission_key is None:
            return

        permission = await self.permission_repository.get_by_key(permission_key)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group permission key does not exist.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group permission key is inactive.",
            )

    async def _validate_parent_group(
        self,
        parent_group_id: int | None,
        current_group_id: int | None = None,
    ) -> None:
        if parent_group_id is None:
            return

        if current_group_id is not None and parent_group_id == current_group_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group cannot be its own parent.",
            )

        parent_group = await self.repository.get_by_id(parent_group_id)

        if not parent_group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent navigation group not found or inactive.",
            )

        if current_group_id is None:
            return

        current_parent_id = parent_group.parent_group_id

        while current_parent_id is not None:
            if current_parent_id == current_group_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent group. This would create a navigation group cycle.",
                )

            parent = await self.repository.get_by_id_any_status(current_parent_id)

            if not parent:
                break

            current_parent_id = parent.parent_group_id

    async def list_navigation_groups(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        parent_group_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ):
        items, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            parent_group_id=parent_group_id,
            is_visible=is_visible,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_navigation_group(self, group_id: int):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        return group

    async def create_navigation_group(
        self,
        payload: NavigationGroupCreate,
        created_by: str,
    ):
        existing_group = await self.repository.get_by_key(payload.group_key)

        if existing_group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group key already exists.",
            )

        await self._validate_parent_group(payload.parent_group_id)
        await self._validate_permission_key(payload.group_permission_key)

        data = payload.model_dump()

        group = await self.repository.create(
            data=data,
            created_by=created_by,
        )

        return {
            "message": "Navigation group created successfully.",
            "data": group,
        }

    async def update_navigation_group(
        self,
        group_id: int,
        payload: NavigationGroupUpdate,
        updated_by: str,
    ):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "group_key" in update_data:
            existing_group = await self.repository.get_by_key(
                update_data["group_key"]
            )

            if existing_group and existing_group.id != group.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Navigation group key already exists.",
                )

        if "parent_group_id" in update_data:
            await self._validate_parent_group(
                parent_group_id=update_data["parent_group_id"],
                current_group_id=group.id,
            )

        if "group_permission_key" in update_data:
            await self._validate_permission_key(update_data["group_permission_key"])

        updated_group = await self.repository.update(
            group=group,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Navigation group updated successfully.",
            "data": updated_group,
        }

    async def deactivate_navigation_group(
        self,
        group_id: int,
        updated_by: str,
    ):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        if not group.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group is already inactive.",
            )

        updated_group = await self.repository.deactivate(
            group=group,
            updated_by=updated_by,
        )

        return {
            "message": "Navigation group deactivated successfully.",
            "data": updated_group,
        }

    async def restore_navigation_group(
        self,
        group_id: int,
        updated_by: str,
    ):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        if group.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group is already active.",
            )

        updated_group = await self.repository.restore(
            group=group,
            updated_by=updated_by,
        )

        return {
            "message": "Navigation group restored successfully.",
            "data": updated_group,
        }

    async def permanent_delete_navigation_group(self, group_id: int):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        child_group_count = await self.repository.count_child_groups(group_id)
        menu_count = await self.repository.count_menus(group_id)

        if child_group_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This navigation group has child group(s). Remove them first.",
            )

        if menu_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This navigation group has menu(s). Remove menus first.",
            )

        await self.repository.permanent_delete(group)

        return {
            "message": "Navigation group permanently deleted successfully.",
            "data": None,
        }