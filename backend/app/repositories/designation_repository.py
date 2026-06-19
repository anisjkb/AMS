# E:\Audit\AMS\backend\app\repositories\designation_repository.py

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.branch import Branch
from app.models.company import Company
from app.models.department import Department
from app.models.designation import Designation
from app.models.user import User
from app.schemas.designation import DesignationCreate, DesignationUpdate


class DesignationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
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
        stmt = select(Designation)

        if company_id is not None:
            stmt = stmt.where(Designation.company_id == company_id)

        if branch_id is not None:
            stmt = stmt.where(Designation.branch_id == branch_id)

        if department_id is not None:
            stmt = stmt.where(Designation.department_id == department_id)

        if is_active is not None:
            stmt = stmt.where(Designation.is_active == is_active)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Designation.designation_code.ilike(search_term),
                    Designation.designation_name.ilike(search_term),
                    Designation.designation_short_name.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": Designation.id,
            "designation_code": Designation.designation_code,
            "designation_name": Designation.designation_name,
            "designation_short_name": Designation.designation_short_name,
            "created_at": Designation.created_at,
            "updated_at": Designation.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Designation.id)
        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        return total or 0, list(result.scalars().all())

    async def get_by_id_any_status(self, designation_id: int) -> Designation | None:
        result = await self.db.execute(
            select(Designation).where(Designation.id == designation_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, designation_code: str) -> Designation | None:
        result = await self.db.execute(
            select(Designation).where(Designation.designation_code == designation_code)
        )
        return result.scalar_one_or_none()

    async def get_by_name_department_branch_company(
        self,
        designation_name: str,
        company_id: int,
        branch_id: int,
        department_id: int,
    ) -> Designation | None:
        result = await self.db.execute(
            select(Designation).where(
                Designation.designation_name == designation_name,
                Designation.company_id == company_id,
                Designation.branch_id == branch_id,
                Designation.department_id == department_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_last_designation(self) -> Designation | None:
        result = await self.db.execute(
            select(Designation).order_by(Designation.id.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_company_by_id(self, company_id: int) -> Company | None:
        result = await self.db.execute(
            select(Company).where(
                Company.id == company_id,
                Company.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_branch_by_id(self, branch_id: int) -> Branch | None:
        result = await self.db.execute(
            select(Branch).where(
                Branch.id == branch_id,
                Branch.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_department_by_id(self, department_id: int) -> Department | None:
        result = await self.db.execute(
            select(Department).where(
                Department.id == department_id,
                Department.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: DesignationCreate,
        designation_code: str,
        created_by: str,
    ) -> Designation:
        data = payload.model_dump(exclude_none=True)

        data.pop("is_active", None)
        data["designation_code"] = designation_code

        designation = Designation(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(designation)
        await self.db.commit()
        await self.db.refresh(designation)
        return designation

    async def update(
        self,
        designation: Designation,
        payload: DesignationUpdate,
        updated_by: str,
    ) -> Designation:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(designation, field, value)

        designation.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(designation)
        return designation

    async def set_active_status(
        self,
        designation: Designation,
        is_active: bool,
        updated_by: str,
    ) -> Designation:
        designation.is_active = is_active
        designation.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(designation)
        return designation

    async def permanent_delete(self, designation: Designation) -> None:
        await self.db.delete(designation)
        await self.db.commit()

    async def has_child_records(self, designation_id: int) -> bool:
        # Employee module তৈরি হলে child check add হবে।
        return False

    async def get_user_full_name_by_user_id(self, user_id: str | None) -> str | None:
        if not user_id:
            return None

        result = await self.db.execute(
            select(User.full_name).where(User.user_id == user_id)
        )
        return result.scalar_one_or_none()