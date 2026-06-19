from fastapi import HTTPException

from app.repositories.branch_repository import BranchRepository
from app.services.branch.helpers import branch_with_user_names


async def deactivate_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
    updated_by: str,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    branch = await branch_repo.set_active_status(
        branch=branch,
        is_active=False,
        updated_by=updated_by,
    )

    return {
        "message": "Branch deactivated successfully",
        "data": await branch_with_user_names(branch, branch_repo),
    }