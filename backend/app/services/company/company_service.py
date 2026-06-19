# backend/app/services/company/company_service.py

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.services.company.create_company import create_company_service
from app.services.company.delete_company import deactivate_company_service
from app.services.company.get_company import get_company_service
from app.services.company.list_company import list_companies_service
from app.services.company.permanent_delete_company import (
    permanent_delete_company_service,
)
from app.services.company.restore_company import restore_company_service
from app.services.company.update_company import update_company_service


class CompanyService:
    def __init__(self, db: AsyncSession):
        self.company_repo = CompanyRepository(db)

    async def list_companies(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        return await list_companies_service(
            company_repo=self.company_repo,
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_company(
        self,
        company_id: int,
    ):
        return await get_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
        )

    async def create_company(
        self,
        payload: CompanyCreate,
        created_by: str,
    ):
        return await create_company_service(
            company_repo=self.company_repo,
            payload=payload,
            created_by=created_by,
        )

    async def update_company(
        self,
        company_id: int,
        payload: CompanyUpdate,
        updated_by: str,
    ):
        return await update_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
            payload=payload,
            updated_by=updated_by,
        )

    async def deactivate_company(
        self,
        company_id: int,
        updated_by: str,
    ):
        return await deactivate_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
            updated_by=updated_by,
        )

    async def restore_company(
        self,
        company_id: int,
        updated_by: str,
    ):
        return await restore_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
            updated_by=updated_by,
        )

    async def permanent_delete_company(
        self,
        company_id: int,
    ):
        return await permanent_delete_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
        )