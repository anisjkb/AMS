#app/services/department/delete_department.py
from fastapi import HTTPException

from app.repositories.department_repository import DepartmentRepository
from app.services.department.helpers import department_with_user_names


async def deactivate_department_service(
    department_repo: DepartmentRepository,
    department_id: int,
    updated_by: str,
):
    department = await department_repo.get_by_id_any_status(department_id)

    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    department = await department_repo.set_active_status(
        department=department,
        is_active=False,
        updated_by=updated_by,
    )

    return {
        "message": "Department deleted successfully",
        "data": await department_with_user_names(department, department_repo),
    }