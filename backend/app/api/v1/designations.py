from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.designation import (
    DesignationCreate,
    DesignationListResponse,
    DesignationMessageResponse,
    DesignationResponse,
    DesignationUpdate,
)
from app.services.designation.designation_service import DesignationService

router = APIRouter(prefix="/designations", tags=["Designations"])


@router.get("", response_model=DesignationListResponse)
async def list_designations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    company_id: int | None = None,
    branch_id: int | None = None,
    department_id: int | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.designation.view")),
):
    service = DesignationService(db)
    return await service.list_designations(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        branch_id=branch_id,
        department_id=department_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{designation_id}", response_model=DesignationResponse)
async def get_designation(
    designation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.designation.view")),
):
    service = DesignationService(db)
    return await service.get_designation(designation_id)


@router.post(
    "",
    response_model=DesignationMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_designation(
    payload: DesignationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.designation.create")),
):
    service = DesignationService(db)
    return await service.create_designation(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{designation_id}", response_model=DesignationMessageResponse)
async def update_designation(
    designation_id: int,
    payload: DesignationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.designation.update")),
):
    service = DesignationService(db)
    return await service.update_designation(
        designation_id=designation_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{designation_id}", response_model=DesignationMessageResponse)
async def delete_designation(
    designation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.designation.delete")),
):
    service = DesignationService(db)
    return await service.deactivate_designation(
        designation_id=designation_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{designation_id}/restore", response_model=DesignationMessageResponse)
async def restore_designation(
    designation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.designation.restore")),
):
    service = DesignationService(db)
    return await service.restore_designation(
        designation_id=designation_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{designation_id}/permanent")
async def permanent_delete_designation(
    designation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.designation.permanent_delete")
    ),
):
    service = DesignationService(db)
    return await service.permanent_delete_designation(designation_id)