from app.repositories.branch_repository import BranchRepository
from app.services.branch.helpers import branch_with_user_names


async def list_branches_service(
    branch_repo: BranchRepository,
    page: int,
    page_size: int,
    search: str | None,
    company_id: int | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
):
    total, branches = await branch_repo.list_paginated(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            await branch_with_user_names(branch, branch_repo)
            for branch in branches
        ],
    }