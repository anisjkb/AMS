# backend/app/repositories/company_repository.py

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.branch import Branch
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate


class CompanyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(Company)

        if is_active is not None:
            stmt = stmt.where(Company.is_active == is_active)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Company.company_code.ilike(search_term),
                    Company.company_name.ilike(search_term),
                    Company.company_short_name.ilike(search_term),
                    Company.company_email.ilike(search_term),
                    Company.company_phone.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": Company.id,
            "company_code": Company.company_code,
            "company_name": Company.company_name,
            "created_at": Company.created_at,
            "updated_at": Company.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Company.id)

        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        companies = list(result.scalars().all())

        return total or 0, companies

    async def get_by_id_any_status(self, company_id: int) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.id == company_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_active(self, company_id: int) -> Company | None:
        result = await self.db.execute(
            select(Company).where(
                Company.id == company_id,
                Company.is_active == True,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, company_code: str) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.company_code == company_code)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, company_name: str) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.company_name == company_name)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, company_email: str) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.company_email == company_email)
        )
        return result.scalar_one_or_none()

    async def get_by_phone(self, company_phone: str) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.company_phone == company_phone)
        )
        return result.scalar_one_or_none()

    async def get_last_company(self) -> Company | None:
        result = await self.db.execute(
            select(Company).order_by(Company.id.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: CompanyCreate,
        company_code: str,
        created_by: str,
    ) -> Company:
        data = payload.model_dump()
        data["company_code"] = company_code

        company = Company(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(company)
        await self.db.commit()
        await self.db.refresh(company)

        return company

    async def update(
        self,
        company: Company,
        payload: CompanyUpdate,
        updated_by: str,
    ) -> Company:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(company, field, value)

        company.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(company)

        return company

    async def set_active_status(
        self,
        company: Company,
        is_active: bool,
        updated_by: str,
    ) -> Company:
        company.is_active = is_active
        company.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(company)

        return company

    async def permanent_delete(self, company: Company) -> None:
        await self.db.delete(company)
        await self.db.commit()

    async def has_child_records(self, company_id: int) -> bool:
        branch_count = await self.db.scalar(
            select(func.count()).select_from(Branch).where(
                Branch.company_id == company_id
            )
        )

        return bool(branch_count and branch_count > 0)

    async def get_user_full_name_by_user_id(
        self,
        user_id: str | None,
    ) -> str | None:
        if not user_id:
            return None

        result = await self.db.execute(
            select(User.full_name).where(User.user_id == user_id)
        )

        return result.scalar_one_or_none()