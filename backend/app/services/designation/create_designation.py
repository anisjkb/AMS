from fastapi import HTTPException, status

from app.repositories.designation_repository import DesignationRepository
from app.schemas.designation import DesignationCreate
from app.services.designation.helpers import (
    designation_with_user_names,
    generate_designation_code,
)


async def create_designation_service(
    designation_repo: DesignationRepository,
    payload: DesignationCreate,
    created_by: str,
):
    company = await designation_repo.get_company_by_id(payload.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company not found or inactive",
        )

    branch = await designation_repo.get_branch_by_id(payload.branch_id)
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

    department = await designation_repo.get_department_by_id(payload.department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department not found or inactive",
        )

    if (
        department.company_id != payload.company_id
        or department.branch_id != payload.branch_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department does not belong to selected company/branch",
        )

    designation_code = payload.designation_code

    if not designation_code:
        designation_code = await generate_designation_code(designation_repo)

    existing_code = await designation_repo.get_by_code(designation_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Designation code already exists",
        )

    existing_name = await designation_repo.get_by_name_department_branch_company(
        designation_name=payload.designation_name,
        company_id=payload.company_id,
        branch_id=payload.branch_id,
        department_id=payload.department_id,
    )
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Designation name already exists under this department",
        )

    designation = await designation_repo.create(
        payload=payload,
        designation_code=designation_code,
        created_by=created_by,
    )

    return {
        "message": "Designation created successfully",
        "data": await designation_with_user_names(designation, designation_repo),
    }