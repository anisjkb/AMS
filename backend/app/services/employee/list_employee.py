from app.repositories.employee_repository import EmployeeRepository
from app.services.employee.helpers import employee_with_names

async def list_employees_service(
    employee_repo: EmployeeRepository,
    page: int,
    page_size: int,
    search: str | None,
    company_id: int | None,
    branch_id: int | None,
    department_id: int | None,
    designation_id: int | None,
    employee_type: str | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
):
    total, employees = await employee_repo.list_paginated(
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

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            await employee_with_names(employee, employee_repo)
            for employee in employees
        ],
    }