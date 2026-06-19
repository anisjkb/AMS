from app.models.branch import Branch
from app.repositories.branch_repository import BranchRepository


async def branch_with_user_names(
    branch: Branch,
    branch_repo: BranchRepository,
) -> dict:
    return {
        "id": branch.id,
        "branch_code": branch.branch_code,
        "branch_name": branch.branch_name,
        "company_id": branch.company_id,
        "branch_email": branch.branch_email,
        "branch_phone": branch.branch_phone,
        "branch_address": branch.branch_address,
        "remarks": branch.remarks,
        "is_active": branch.is_active,
        "created_by": branch.created_by,
        "updated_by": branch.updated_by,
        "created_at": branch.created_at,
        "updated_at": branch.updated_at,
        "created_by_name": await branch_repo.get_user_full_name_by_user_id(
            branch.created_by
        ),
        "updated_by_name": await branch_repo.get_user_full_name_by_user_id(
            branch.updated_by
        ),
    }


async def generate_branch_code(branch_repo: BranchRepository) -> str:
    last_branch = await branch_repo.get_last_branch()

    if not last_branch:
        return "BR00001"

    next_id = last_branch.id + 1
    return f"BR{next_id:05d}"