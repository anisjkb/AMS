from fastapi import HTTPException

from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import EmployeeUpdate
from app.services.employee.helpers import employee_with_names


async def update_employee_service(
    employee_repo: EmployeeRepository,
    employee_id: int,
    payload: EmployeeUpdate,
    updated_by: str,
):
    employee = await employee_repo.get_by_id_any_status(employee_id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    target_company_id = payload.company_id if payload.company_id is not None else employee.company_id
    target_branch_id = payload.branch_id if payload.branch_id is not None else employee.branch_id
    target_department_id = (
        payload.department_id if payload.department_id is not None else employee.department_id
    )
    target_designation_id = (
        payload.designation_id if payload.designation_id is not None else employee.designation_id
    )

    if payload.company_id is not None:
        company = await employee_repo.get_company_by_id(payload.company_id)
        if not company:
            raise HTTPException(status_code=400, detail="Company not found or inactive")

    if payload.branch_id is not None:
        branch = await employee_repo.get_branch_by_id(payload.branch_id)
        if not branch:
            raise HTTPException(status_code=400, detail="Branch not found or inactive")
        if branch.company_id != target_company_id:
            raise HTTPException(
                status_code=400,
                detail="Branch does not belong to selected company",
            )

    if payload.department_id is not None:
        department = await employee_repo.get_department_by_id(payload.department_id)
        if not department:
            raise HTTPException(status_code=400, detail="Department not found or inactive")
        if department.company_id != target_company_id or department.branch_id != target_branch_id:
            raise HTTPException(
                status_code=400,
                detail="Department does not belong to selected company/branch",
            )

    if payload.designation_id is not None:
        designation = await employee_repo.get_designation_by_id(payload.designation_id)
        if not designation:
            raise HTTPException(status_code=400, detail="Designation not found or inactive")
        if (
            designation.company_id != target_company_id
            or designation.branch_id != target_branch_id
            or designation.department_id != target_department_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Designation does not belong to selected company/branch/department",
            )

    if payload.reporting_to_employee_id:
        if payload.reporting_to_employee_id == employee.id:
            raise HTTPException(
                status_code=400,
                detail="Employee cannot report to himself/herself",
            )

        reporting_employee = await employee_repo.get_by_id_any_status(
            payload.reporting_to_employee_id
        )
        if not reporting_employee or not reporting_employee.is_active:
            raise HTTPException(
                status_code=400,
                detail="Reporting employee not found or inactive",
            )

    if (
        payload.official_employee_id
        and payload.official_employee_id != employee.official_employee_id
    ):
        existing = await employee_repo.get_by_official_employee_id(
            payload.official_employee_id
        )
        if existing:
            raise HTTPException(status_code=400, detail="Official employee ID already exists")

    if payload.email and payload.email != employee.email:
        existing_email = await employee_repo.get_by_email(payload.email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Employee email already exists")

    if payload.phone and payload.phone != employee.phone:
        existing_phone = await employee_repo.get_by_phone(payload.phone)
        if existing_phone:
            raise HTTPException(status_code=400, detail="Employee phone already exists")

    if payload.nid and payload.nid != employee.nid:
        existing_nid = await employee_repo.get_by_nid(payload.nid)
        if existing_nid:
            raise HTTPException(status_code=400, detail="Employee NID already exists")

    updated_employee = await employee_repo.update(
        employee=employee,
        payload=payload,
        updated_by=updated_by,
    )

    return {
        "message": "Employee updated successfully",
        "data": await employee_with_names(updated_employee, employee_repo),
    }