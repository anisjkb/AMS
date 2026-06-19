#app/services/department/list_department.py
from app.repositories.department_repository import DepartmentRepository
from app.services.department.helpers import department_with_user_names


async def list_departments_service(
    department_repo: DepartmentRepository,
    page: int,
    page_size: int,
    search: str | None,
    company_id: int | None,
    branch_id: int | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
):
    total, departments = await department_repo.list_paginated(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        branch_id=branch_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            await department_with_user_names(department, department_repo)
            for department in departments
        ],
    }