# backend/app/services/department/update_department.py

from fastapi import HTTPException

from app.repositories.department_repository import DepartmentRepository
from app.schemas.department import DepartmentUpdate
from app.services.department.helpers import department_with_user_names

async def update_department_service(
    department_repo: DepartmentRepository,
    department_id: int,
    payload: DepartmentUpdate,
    updated_by: str,
):
    department = await department_repo.get_by_id_any_status(department_id)

    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    target_company_id = (
        payload.company_id if payload.company_id is not None else department.company_id
    )
    target_branch_id = (
        payload.branch_id if payload.branch_id is not None else department.branch_id
    )

    if payload.company_id is not None:
        company = await department_repo.get_company_by_id(payload.company_id)
        if not company:
            raise HTTPException(status_code=400, detail="Company not found or inactive")

    if payload.company_id is not None or payload.branch_id is not None:
        branch = await department_repo.get_branch_by_id(target_branch_id)
        if not branch:
            raise HTTPException(status_code=400, detail="Branch not found or inactive")

        if branch.company_id != target_company_id:
            raise HTTPException(
                status_code=400,
                detail="Branch does not belong to selected company",
            )

    if payload.department_code and payload.department_code != department.department_code:
        existing_code = await department_repo.get_by_code(payload.department_code)
        if existing_code and existing_code.id != department.id:
            raise HTTPException(status_code=400, detail="Department code already exists")

    if payload.department_name and (
        payload.department_name != department.department_name
        or target_company_id != department.company_id
        or target_branch_id != department.branch_id
    ):
        existing_name = await department_repo.get_by_name_branch_company(
            department_name=payload.department_name,
            company_id=target_company_id,
            branch_id=target_branch_id,
        )
        if existing_name and existing_name.id != department.id:
            raise HTTPException(
                status_code=400,
                detail="Department name already exists under this branch",
            )

    if payload.department_email and payload.department_email != department.department_email:
        existing_email = await department_repo.get_by_email(payload.department_email)
        if existing_email and existing_email.id != department.id:
            raise HTTPException(status_code=400, detail="Department email already exists")

    if payload.department_phone and payload.department_phone != department.department_phone:
        existing_phone = await department_repo.get_by_phone(payload.department_phone)
        if existing_phone and existing_phone.id != department.id:
            raise HTTPException(status_code=400, detail="Department phone already exists")

    updated_department = await department_repo.update(
        department=department,
        payload=payload,
        updated_by=updated_by,
    )

    return {
        "message": "Department updated successfully",
        "data": await department_with_user_names(updated_department, department_repo),
    }