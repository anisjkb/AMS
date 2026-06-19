from fastapi import HTTPException, status

from app.repositories.branch_repository import BranchRepository
from app.schemas.branch import BranchCreate
from app.services.branch.helpers import branch_with_user_names, generate_branch_code


async def create_branch_service(
    branch_repo: BranchRepository,
    payload: BranchCreate,
    created_by: str,
):
    company = await branch_repo.get_company_by_id(payload.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company not found or inactive",
        )

    branch_code = payload.branch_code

    if not branch_code:
        branch_code = await generate_branch_code(branch_repo)

    existing_code = await branch_repo.get_by_code(branch_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch code already exists",
        )

    existing_name = await branch_repo.get_by_name_and_company(
        branch_name=payload.branch_name,
        company_id=payload.company_id,
    )
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch name already exists under this company",
        )

    if payload.branch_email:
        existing_email = await branch_repo.get_by_email(payload.branch_email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch email already exists",
            )

    if payload.branch_phone:
        existing_phone = await branch_repo.get_by_phone(payload.branch_phone)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch phone already exists",
            )

    branch = await branch_repo.create(
        payload=payload,
        branch_code=branch_code,
        created_by=created_by,
    )

    return {
        "message": "Branch created successfully",
        "data": await branch_with_user_names(branch, branch_repo),
    }