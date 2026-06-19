from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.designation_repository import DesignationRepository
from app.schemas.designation import DesignationCreate, DesignationUpdate
from app.services.designation.create_designation import create_designation_service
from app.services.designation.delete_designation import deactivate_designation_service
from app.services.designation.get_designation import get_designation_service
from app.services.designation.list_designation import list_designations_service
from app.services.designation.permanent_delete_designation import (
    permanent_delete_designation_service,
)
from app.services.designation.restore_designation import restore_designation_service
from app.services.designation.update_designation import update_designation_service


class DesignationService:
    def __init__(self, db: AsyncSession):
        self.designation_repo = DesignationRepository(db)

    async def list_designations(
        self,
        page: int,
        page_size: int,
        search: str | None,
        company_id: int | None,
        branch_id: int | None,
        department_id: int | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        return await list_designations_service(
            designation_repo=self.designation_repo,
            page=page,
            page_size=page_size,
            search=search,
            company_id=company_id,
            branch_id=branch_id,
            department_id=department_id,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_designation(self, designation_id: int):
        return await get_designation_service(
            designation_repo=self.designation_repo,
            designation_id=designation_id,
        )

    async def create_designation(
        self,
        payload: DesignationCreate,
        created_by: str,
    ):
        return await create_designation_service(
            designation_repo=self.designation_repo,
            payload=payload,
            created_by=created_by,
        )

    async def update_designation(
        self,
        designation_id: int,
        payload: DesignationUpdate,
        updated_by: str,
    ):
        return await update_designation_service(
            designation_repo=self.designation_repo,
            designation_id=designation_id,
            payload=payload,
            updated_by=updated_by,
        )

    async def deactivate_designation(
        self,
        designation_id: int,
        updated_by: str,
    ):
        return await deactivate_designation_service(
            designation_repo=self.designation_repo,
            designation_id=designation_id,
            updated_by=updated_by,
        )

    async def restore_designation(
        self,
        designation_id: int,
        updated_by: str,
    ):
        return await restore_designation_service(
            designation_repo=self.designation_repo,
            designation_id=designation_id,
            updated_by=updated_by,
        )

    async def permanent_delete_designation(self, designation_id: int):
        return await permanent_delete_designation_service(
            designation_repo=self.designation_repo,
            designation_id=designation_id,
        )