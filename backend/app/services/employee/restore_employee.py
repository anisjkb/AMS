from fastapi import HTTPException

from app.repositories.employee_repository import EmployeeRepository
from app.services.employee.helpers import employee_with_names


async def restore_employee_service(
    employee_repo: EmployeeRepository,
    employee_id: int,
    updated_by: str,
):
    employee = await employee_repo.get_by_id_any_status(employee_id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee = await employee_repo.set_active_status(
        employee=employee,
        is_active=True,
        updated_by=updated_by,
    )

    return {
        "message": "Employee restored successfully",
        "data": await employee_with_names(employee, employee_repo),
    }