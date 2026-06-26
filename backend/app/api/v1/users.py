# E:\Audit\AMS\backend\app\api\v1\users.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserListResponse,
    UserMeResponse,
    UserMessageResponse,
    UserResponse,
    UserUpdate,
)
from app.services.user.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    is_superuser: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.user.view")),
):
    service = UserService(db)
    return await service.list_users(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        is_superuser=is_superuser,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.user.view")),
):
    service = UserService(db)
    return await service.get_user(user_id)


@router.post(
    "",
    response_model=UserMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.create")),
):
    service = UserService(db)
    return await service.create_user(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{user_id}", response_model=UserMessageResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.update")),
):
    service = UserService(db)
    return await service.update_user(
        user_id=user_id,
        payload=payload,
        current_user_id=current_user.id,
        updated_by=current_user.user_id,
    )


@router.delete("/{user_id}", response_model=UserMessageResponse)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.delete")),
):
    service = UserService(db)
    return await service.deactivate_user(
        user_id=user_id,
        current_user_id=current_user.id,
        updated_by=current_user.user_id,
    )


@router.patch("/{user_id}/restore", response_model=UserMessageResponse)
async def restore_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.restore")),
):
    service = UserService(db)
    return await service.restore_user(
        user_id=user_id,
        updated_by=current_user.user_id,
    )