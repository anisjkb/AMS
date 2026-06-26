
# E:\Audit\AMS\backend\app\api\v1\navigation_groups.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.navigation_group import (
    NavigationGroupCreate,
    NavigationGroupListResponse,
    NavigationGroupMessageResponse,
    NavigationGroupResponse,
    NavigationGroupUpdate,
)
from app.services.navigation_group.navigation_group_service import (
    NavigationGroupService,
)

router = APIRouter(prefix="/navigation-groups", tags=["Navigation Groups"])


@router.get("", response_model=NavigationGroupListResponse)
async def list_navigation_groups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    parent_group_id: int | None = None,
    is_visible: bool | None = None,
    is_active: bool | None = None,
    sort_by: str = "sort_order",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.navigation_group.view")),
):
    service = NavigationGroupService(db)
    return await service.list_navigation_groups(
        page=page,
        page_size=page_size,
        search=search,
        parent_group_id=parent_group_id,
        is_visible=is_visible,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{group_id}", response_model=NavigationGroupResponse)
async def get_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.navigation_group.view")),
):
    service = NavigationGroupService(db)
    return await service.get_navigation_group(group_id)


@router.post(
    "",
    response_model=NavigationGroupMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_navigation_group(
    payload: NavigationGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.create")),
):
    service = NavigationGroupService(db)
    return await service.create_navigation_group(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{group_id}", response_model=NavigationGroupMessageResponse)
async def update_navigation_group(
    group_id: int,
    payload: NavigationGroupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.update")),
):
    service = NavigationGroupService(db)
    return await service.update_navigation_group(
        group_id=group_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{group_id}", response_model=NavigationGroupMessageResponse)
async def delete_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.delete")),
):
    service = NavigationGroupService(db)
    return await service.deactivate_navigation_group(
        group_id=group_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{group_id}/restore", response_model=NavigationGroupMessageResponse)
async def restore_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.restore")),
):
    service = NavigationGroupService(db)
    return await service.restore_navigation_group(
        group_id=group_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{group_id}/permanent",
    response_model=NavigationGroupMessageResponse,
)
async def permanent_delete_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.navigation_group.permanent_delete")
    ),
):
    service = NavigationGroupService(db)
    return await service.permanent_delete_navigation_group(group_id)