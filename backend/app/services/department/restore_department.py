# backend/app/services/department/restore_department.py

from fastapi import HTTPException
from app.repositories.department_repository import DepartmentRepository
from app.services.department.helpers import department_with_user_names

async def restore_department_service(
    department_repo: DepartmentRepository,
    department_id: int,
    updated_by: str,
):
    department = await department_repo.get_by_id_any_status(department_id)

    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    company = await department_repo.get_company_by_id(department.company_id)
    if not company:
        raise HTTPException(status_code=400, detail="Company not found or inactive")

    branch = await department_repo.get_branch_by_id(department.branch_id)
    if not branch:
        raise HTTPException(status_code=400, detail="Branch not found or inactive")

    if branch.company_id != department.company_id:
        raise HTTPException(
            status_code=400,
            detail="Branch does not belong to selected company",
        )

    department = await department_repo.set_active_status(
        department=department,
        is_active=True,
        updated_by=updated_by,
    )

    return {
        "message": "Department restored successfully",
        "data": await department_with_user_names(department, department_repo),
    }