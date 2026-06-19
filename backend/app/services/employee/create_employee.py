from fastapi import HTTPException, status

from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import EmployeeCreate
from app.services.employee.helpers import employee_with_names, generate_employee_code


async def create_employee_service(
    employee_repo: EmployeeRepository,
    payload: EmployeeCreate,
    created_by: str,
):
    company = await employee_repo.get_company_by_id(payload.company_id)
    if not company:
        raise HTTPException(status_code=400, detail="Company not found or inactive")

    branch = await employee_repo.get_branch_by_id(payload.branch_id)
    if not branch:
        raise HTTPException(status_code=400, detail="Branch not found or inactive")

    if branch.company_id != payload.company_id:
        raise HTTPException(
            status_code=400,
            detail="Branch does not belong to selected company",
        )

    department = await employee_repo.get_department_by_id(payload.department_id)
    if not department:
        raise HTTPException(status_code=400, detail="Department not found or inactive")

    if department.company_id != payload.company_id or department.branch_id != payload.branch_id:
        raise HTTPException(
            status_code=400,
            detail="Department does not belong to selected company/branch",
        )

    designation = await employee_repo.get_designation_by_id(payload.designation_id)
    if not designation:
        raise HTTPException(status_code=400, detail="Designation not found or inactive")

    if (
        designation.company_id != payload.company_id
        or designation.branch_id != payload.branch_id
        or designation.department_id != payload.department_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Designation does not belong to selected company/branch/department",
        )

    if payload.reporting_to_employee_id:
        reporting_employee = await employee_repo.get_by_id_any_status(
            payload.reporting_to_employee_id
        )
        if not reporting_employee or not reporting_employee.is_active:
            raise HTTPException(
                status_code=400,
                detail="Reporting employee not found or inactive",
            )

    employee_code = payload.employee_code

    if not employee_code:
        employee_code = await generate_employee_code(employee_repo)

    existing_code = await employee_repo.get_by_code(employee_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee code already exists",
        )

    if payload.official_employee_id:
        existing_official_id = await employee_repo.get_by_official_employee_id(
            payload.official_employee_id
        )
        if existing_official_id:
            raise HTTPException(
                status_code=400,
                detail="Official employee ID already exists",
            )

    if payload.email:
        existing_email = await employee_repo.get_by_email(payload.email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Employee email already exists")

    if payload.phone:
        existing_phone = await employee_repo.get_by_phone(payload.phone)
        if existing_phone:
            raise HTTPException(status_code=400, detail="Employee phone already exists")

    if payload.nid:
        existing_nid = await employee_repo.get_by_nid(payload.nid)
        if existing_nid:
            raise HTTPException(status_code=400, detail="Employee NID already exists")

    employee = await employee_repo.create(
        payload=payload,
        employee_code=employee_code,
        created_by=created_by,
    )

    return {
        "message": "Employee created successfully",
        "data": await employee_with_names(employee, employee_repo),
    }