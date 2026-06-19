from fastapi import HTTPException, status

from app.repositories.employee_repository import EmployeeRepository
from app.services.employee.helpers import employee_with_names


async def get_employee_service(
    employee_repo: EmployeeRepository,
    employee_id: int,
):
    employee = await employee_repo.get_by_id_any_status(employee_id)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return await employee_with_names(employee, employee_repo)