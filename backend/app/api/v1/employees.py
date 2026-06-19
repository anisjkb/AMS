#backend/app/api/v1/employees.py

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeListResponse,
    EmployeeMessageResponse,
    EmployeeResponse,
    EmployeeUpdate,
)
from app.services.employee.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=EmployeeListResponse)
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    company_id: int | None = None,
    branch_id: int | None = None,
    department_id: int | None = None,
    designation_id: int | None = None,
    employee_type: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.employee.view")),
):
    service = EmployeeService(db)
    return await service.list_employees(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        branch_id=branch_id,
        department_id=department_id,
        designation_id=designation_id,
        employee_type=employee_type,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.employee.view")),
):
    service = EmployeeService(db)
    return await service.get_employee(employee_id)


@router.post(
    "",
    response_model=EmployeeMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_employee(
    payload: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.employee.create")),
):
    service = EmployeeService(db)
    return await service.create_employee(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{employee_id}", response_model=EmployeeMessageResponse)
async def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.employee.update")),
):
    service = EmployeeService(db)
    return await service.update_employee(
        employee_id=employee_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{employee_id}", response_model=EmployeeMessageResponse)
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.employee.delete")),
):
    service = EmployeeService(db)
    return await service.deactivate_employee(
        employee_id=employee_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{employee_id}/restore", response_model=EmployeeMessageResponse)
async def restore_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.employee.restore")),
):
    service = EmployeeService(db)
    return await service.restore_employee(
        employee_id=employee_id,
        updated_by=current_user.user_id,
    )

@router.post("/{employee_id}/photo", response_model=EmployeeMessageResponse)
async def upload_employee_photo(
    employee_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.employee.update")),
):
    service = EmployeeService(db)
    return await service.upload_employee_photo(
        employee_id=employee_id,
        file=file,
        updated_by=current_user.user_id,
    )


@router.delete("/{employee_id}/photo", response_model=EmployeeMessageResponse)
async def delete_employee_photo(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.employee.update")),
):
    service = EmployeeService(db)
    return await service.delete_employee_photo(
        employee_id=employee_id,
        updated_by=current_user.user_id,
    )

@router.delete("/{employee_id}/permanent")
async def permanent_delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.employee.permanent_delete")),
):
    service = EmployeeService(db)
    return await service.permanent_delete_employee(employee_id)