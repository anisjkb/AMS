#app/api/v1/branches.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.branch import (
    BranchCreate,
    BranchListResponse,
    BranchMessageResponse,
    BranchResponse,
    BranchUpdate,
)
from app.services.branch.branch_service import BranchService

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.get("", response_model=BranchListResponse)
async def list_branches(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    company_id: int | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.branch.view")),
):
    service = BranchService(db)
    return await service.list_branches(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.branch.view")),
):
    service = BranchService(db)
    return await service.get_branch(branch_id)


@router.post(
    "",
    response_model=BranchMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_branch(
    payload: BranchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.create")),
):
    service = BranchService(db)
    return await service.create_branch(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{branch_id}", response_model=BranchMessageResponse)
async def update_branch(
    branch_id: int,
    payload: BranchUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.update")),
):
    service = BranchService(db)
    return await service.update_branch(
        branch_id=branch_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{branch_id}", response_model=BranchMessageResponse)
async def delete_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.delete")),
):
    service = BranchService(db)
    return await service.deactivate_branch(
        branch_id=branch_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{branch_id}/restore", response_model=BranchMessageResponse)
async def restore_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.restore")),
):
    service = BranchService(db)
    return await service.restore_branch(
        branch_id=branch_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{branch_id}/permanent")
async def permanent_delete_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.permanent_delete")),
):
    service = BranchService(db)
    return await service.permanent_delete_branch(branch_id)