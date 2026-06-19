#app/api/v1/departments.py
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentListResponse,
    DepartmentMessageResponse,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.services.department.department_service import DepartmentService

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("", response_model=DepartmentListResponse)
async def list_departments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    company_id: int | None = None,
    branch_id: int | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.department.view")),
):
    service = DepartmentService(db)
    return await service.list_departments(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        branch_id=branch_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.department.view")),
):
    service = DepartmentService(db)
    return await service.get_department(department_id)


@router.post(
    "",
    response_model=DepartmentMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_department(
    payload: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.department.create")),
):
    service = DepartmentService(db)
    return await service.create_department(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{department_id}", response_model=DepartmentMessageResponse)
async def update_department(
    department_id: int,
    payload: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.department.update")),
):
    service = DepartmentService(db)
    return await service.update_department(
        department_id=department_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{department_id}", response_model=DepartmentMessageResponse)
async def delete_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.department.delete")),
):
    service = DepartmentService(db)
    return await service.deactivate_department(
        department_id=department_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{department_id}/restore", response_model=DepartmentMessageResponse)
async def restore_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.department.restore")),
):
    service = DepartmentService(db)
    return await service.restore_department(
        department_id=department_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{department_id}/permanent")
async def permanent_delete_department(
    department_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.department.permanent_delete")
    ),
):
    service = DepartmentService(db)
    return await service.permanent_delete_department(department_id)