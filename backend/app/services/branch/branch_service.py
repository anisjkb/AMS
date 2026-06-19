from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.branch_repository import BranchRepository
from app.schemas.branch import BranchCreate, BranchUpdate
from app.services.branch.create_branch import create_branch_service
from app.services.branch.delete_branch import deactivate_branch_service
from app.services.branch.get_branch import get_branch_service
from app.services.branch.list_branch import list_branches_service
from app.services.branch.permanent_delete_branch import (
    permanent_delete_branch_service,
)
from app.services.branch.restore_branch import restore_branch_service
from app.services.branch.update_branch import update_branch_service


class BranchService:
    def __init__(self, db: AsyncSession):
        self.branch_repo = BranchRepository(db)

    async def list_branches(
        self,
        page: int,
        page_size: int,
        search: str | None,
        company_id: int | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        return await list_branches_service(
            branch_repo=self.branch_repo,
            page=page,
            page_size=page_size,
            search=search,
            company_id=company_id,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_branch(self, branch_id: int):
        return await get_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
        )

    async def create_branch(
        self,
        payload: BranchCreate,
        created_by: str,
    ):
        return await create_branch_service(
            branch_repo=self.branch_repo,
            payload=payload,
            created_by=created_by,
        )

    async def update_branch(
        self,
        branch_id: int,
        payload: BranchUpdate,
        updated_by: str,
    ):
        return await update_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
            payload=payload,
            updated_by=updated_by,
        )

    async def deactivate_branch(
        self,
        branch_id: int,
        updated_by: str,
    ):
        return await deactivate_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
            updated_by=updated_by,
        )

    async def restore_branch(
        self,
        branch_id: int,
        updated_by: str,
    ):
        return await restore_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
            updated_by=updated_by,
        )

    async def permanent_delete_branch(self, branch_id: int):
        return await permanent_delete_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
        )