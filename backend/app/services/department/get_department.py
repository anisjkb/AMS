#app/services/department/get_department.py
from fastapi import HTTPException, status

from app.repositories.department_repository import DepartmentRepository
from app.services.department.helpers import department_with_user_names


async def get_department_service(
    department_repo: DepartmentRepository,
    department_id: int,
):
    department = await department_repo.get_by_id_any_status(department_id)

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return await department_with_user_names(department, department_repo)