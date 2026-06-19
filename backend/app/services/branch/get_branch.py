from fastapi import HTTPException, status

from app.repositories.branch_repository import BranchRepository
from app.services.branch.helpers import branch_with_user_names


async def get_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found",
        )

    return await branch_with_user_names(branch, branch_repo)