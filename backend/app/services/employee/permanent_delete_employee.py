from fastapi import HTTPException

from app.repositories.employee_repository import EmployeeRepository


async def permanent_delete_employee_service(
    employee_repo: EmployeeRepository,
    employee_id: int,
):
    employee = await employee_repo.get_by_id_any_status(employee_id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    has_child = await employee_repo.has_child_records(employee_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await employee_repo.permanent_delete(employee)

    return {
        "message": "Employee permanently deleted successfully",
    }