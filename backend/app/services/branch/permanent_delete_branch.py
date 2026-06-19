from fastapi import HTTPException

from app.repositories.branch_repository import BranchRepository


async def permanent_delete_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    has_child = await branch_repo.has_child_records(branch_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await branch_repo.permanent_delete(branch)

    return {
        "message": "Branch permanently deleted successfully",
    }