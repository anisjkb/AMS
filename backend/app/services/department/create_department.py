# backend/app/services/department/create_department.py

from fastapi import HTTPException, status
from app.repositories.department_repository import DepartmentRepository
from app.schemas.department import DepartmentCreate
from app.services.department.helpers import (
    department_with_user_names,
    generate_department_code,
)

async def create_department_service(
    department_repo: DepartmentRepository,
    payload: DepartmentCreate,
    created_by: str,
):
    company = await department_repo.get_company_by_id(payload.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company not found or inactive",
        )

    branch = await department_repo.get_branch_by_id(payload.branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch not found or inactive",
        )

    if branch.company_id != payload.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch does not belong to selected company",
        )

    department_code = payload.department_code

    if not department_code:
        department_code = await generate_department_code(department_repo)

    existing_code = await department_repo.get_by_code(department_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department code already exists",
        )

    existing_name = await department_repo.get_by_name_branch_company(
        department_name=payload.department_name,
        company_id=payload.company_id,
        branch_id=payload.branch_id,
    )
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department name already exists under this branch",
        )

    if payload.department_email:
        existing_email = await department_repo.get_by_email(payload.department_email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department email already exists",
            )

    if payload.department_phone:
        existing_phone = await department_repo.get_by_phone(payload.department_phone)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department phone already exists",
            )

    department = await department_repo.create(
        payload=payload,
        department_code=department_code,
        created_by=created_by,
    )

    return {
        "message": "Department created successfully",
        "data": await department_with_user_names(department, department_repo),
    }