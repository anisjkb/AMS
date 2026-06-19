#app/services/department/permanent_delete_department.py
from fastapi import HTTPException

from app.repositories.department_repository import DepartmentRepository


async def permanent_delete_department_service(
    department_repo: DepartmentRepository,
    department_id: int,
):
    department = await department_repo.get_by_id_any_status(department_id)

    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    has_child = await department_repo.has_child_records(department_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await department_repo.permanent_delete(department)

    return {
        "message": "Department permanently deleted successfully",
    }