
# E:\Audit\AMS\backend\app\services\role_permission\role_permission_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.role_permission_repository import RolePermissionRepository
from app.schemas.role_permission import RolePermissionCreate


class RolePermissionService:
    def __init__(self, db: AsyncSession):
        self.repo = RolePermissionRepository(db)

    async def list_permissions_by_role(self, role_id: int) -> list[dict]:
        role = await self.repo.get_role_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        return await self.repo.list_active_by_role_id(role_id)

    async def assign_permission_to_role(
        self,
        payload: RolePermissionCreate,
        created_by: str | None,
    ) -> dict:
        role = await self.repo.get_role_by_id(payload.role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        permission = await self.repo.get_permission_by_id(payload.permission_id)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        data = await self.repo.assign(
            role=role,
            permission=permission,
            created_by=created_by,
        )

        return {
            "message": "Permission assigned to role successfully.",
            "data": data,
        }

    async def remove_role_permission(
        self,
        role_permission_id: int,
        updated_by: str | None,
    ) -> dict:
        role_permission = await self.repo.get_role_permission_by_id(
            role_permission_id
        )

        if not role_permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role permission not found.",
            )

        data = await self.repo.remove(
            role_permission=role_permission,
            updated_by=updated_by,
        )

        return {
            "message": "Permission removed from role successfully.",
            "data": data,
        }