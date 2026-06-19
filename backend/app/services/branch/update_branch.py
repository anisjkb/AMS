from fastapi import HTTPException

from app.repositories.branch_repository import BranchRepository
from app.schemas.branch import BranchUpdate
from app.services.branch.helpers import branch_with_user_names


async def update_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
    payload: BranchUpdate,
    updated_by: str,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    target_company_id = (
        payload.company_id if payload.company_id is not None else branch.company_id
    )

    if payload.company_id is not None:
        company = await branch_repo.get_company_by_id(payload.company_id)
        if not company:
            raise HTTPException(status_code=400, detail="Company not found or inactive")

    if payload.branch_name and (
        payload.branch_name != branch.branch_name
        or target_company_id != branch.company_id
    ):
        existing_name = await branch_repo.get_by_name_and_company(
            branch_name=payload.branch_name,
            company_id=target_company_id,
        )
        if existing_name:
            raise HTTPException(
                status_code=400,
                detail="Branch name already exists under this company",
            )

    if payload.branch_email and payload.branch_email != branch.branch_email:
        existing_email = await branch_repo.get_by_email(payload.branch_email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Branch email already exists")

    if payload.branch_phone and payload.branch_phone != branch.branch_phone:
        existing_phone = await branch_repo.get_by_phone(payload.branch_phone)
        if existing_phone:
            raise HTTPException(status_code=400, detail="Branch phone already exists")

    updated_branch = await branch_repo.update(
        branch=branch,
        payload=payload,
        updated_by=updated_by,
    )

    return {
        "message": "Branch updated successfully",
        "data": await branch_with_user_names(updated_branch, branch_repo),
    }