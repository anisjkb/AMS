# E:\Audit\AMS\backend\app\api\v1\permissions.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.permission import (
    PermissionCreate,
    PermissionListResponse,
    PermissionMessageResponse,
    PermissionResponse,
    PermissionUpdate,
)
from app.services.permission.permission_management_service import (
    PermissionManagementService,
)


router = APIRouter(prefix="/permissions", tags=["Permissions"])


@router.get("", response_model=PermissionListResponse)
async def list_permissions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    resource_type: str | None = None,
    resource_key: str | None = None,
    action: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.permission.view")),
):
    service = PermissionManagementService(db)
    return await service.list_permissions(
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


@router.get("/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.permission.view")),
):
    service = PermissionManagementService(db)
    return await service.get_permission(permission_id)


@router.post(
    "",
    response_model=PermissionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_permission(
    payload: PermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.permission.create")),
):
    service = PermissionManagementService(db)
    return await service.create_permission(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{permission_id}", response_model=PermissionMessageResponse)
async def update_permission(
    permission_id: int,
    payload: PermissionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.permission.update")),
):
    service = PermissionManagementService(db)
    return await service.update_permission(
        permission_id=permission_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{permission_id}", response_model=PermissionMessageResponse)
async def delete_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.permission.delete")),
):
    service = PermissionManagementService(db)
    return await service.deactivate_permission(
        permission_id=permission_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{permission_id}/restore", response_model=PermissionMessageResponse)
async def restore_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.permission.restore")),
):
    service = PermissionManagementService(db)
    return await service.restore_permission(
        permission_id=permission_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{permission_id}/permanent", response_model=PermissionMessageResponse)
async def permanent_delete_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.permission.permanent_delete")
    ),
):
    service = PermissionManagementService(db)
    return await service.permanent_delete_permission(permission_id)

