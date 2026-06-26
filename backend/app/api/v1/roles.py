# E:\Audit\AMS\backend\app\api\v1\roles.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.role import (
    RoleCreate,
    RoleListResponse,
    RoleMessageResponse,
    RoleResponse,
    RoleUpdate,
)
from app.services.role.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", response_model=RoleListResponse)
async def list_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.role.view")),
):
    service = RoleService(db)
    return await service.list_roles(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.role.view")),
):
    service = RoleService(db)
    return await service.get_role(role_id)


@router.post(
    "",
    response_model=RoleMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_role(
    payload: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.create")),
):
    service = RoleService(db)
    return await service.create_role(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{role_id}", response_model=RoleMessageResponse)
async def update_role(
    role_id: int,
    payload: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.update")),
):
    service = RoleService(db)
    return await service.update_role(
        role_id=role_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{role_id}", response_model=RoleMessageResponse)
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.delete")),
):
    service = RoleService(db)
    return await service.deactivate_role(
        role_id=role_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{role_id}/restore", response_model=RoleMessageResponse)
async def restore_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.restore")),
):
    service = RoleService(db)
    return await service.restore_role(
        role_id=role_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{role_id}/permanent", response_model=RoleMessageResponse)
async def permanent_delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.permanent_delete")),
):
    service = RoleService(db)
    return await service.permanent_delete_role(role_id)