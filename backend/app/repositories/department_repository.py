# backend/app/repositories/department_repository.py

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.branch import Branch
from app.models.company import Company
from app.models.department import Department
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        company_id: int | None,
        branch_id: int | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(Department)

        if company_id is not None:
            stmt = stmt.where(Department.company_id == company_id)

        if branch_id is not None:
            stmt = stmt.where(Department.branch_id == branch_id)

        if is_active is not None:
            stmt = stmt.where(Department.is_active == is_active)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Department.department_code.ilike(search_term),
                    Department.department_name.ilike(search_term),
                    Department.department_short_name.ilike(search_term),
                    Department.department_email.ilike(search_term),
                    Department.department_phone.ilike(search_term),
                    Department.department_address.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": Department.id,
            "department_code": Department.department_code,
            "department_name": Department.department_name,
            "department_email": Department.department_email,
            "department_phone": Department.department_phone,
            "created_at": Department.created_at,
            "updated_at": Department.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Department.id)
        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        return total or 0, list(result.scalars().all())

    async def get_by_id_any_status(self, department_id: int) -> Department | None:
        result = await self.db.execute(
            select(Department).where(Department.id == department_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, department_code: str) -> Department | None:
        result = await self.db.execute(
            select(Department).where(Department.department_code == department_code)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, department_email: str) -> Department | None:
        result = await self.db.execute(
            select(Department).where(Department.department_email == department_email)
        )
        return result.scalar_one_or_none()

    async def get_by_phone(self, department_phone: str) -> Department | None:
        result = await self.db.execute(
            select(Department).where(Department.department_phone == department_phone)
        )
        return result.scalar_one_or_none()

    async def get_by_name_branch_company(
        self,
        department_name: str,
        company_id: int,
        branch_id: int,
    ) -> Department | None:
        result = await self.db.execute(
            select(Department).where(
                Department.department_name == department_name,
                Department.company_id == company_id,
                Department.branch_id == branch_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_last_department(self) -> Department | None:
        result = await self.db.execute(
            select(Department).order_by(Department.id.desc()).limit(1)
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

    async def create(
        self,
        payload: DepartmentCreate,
        department_code: str,
        created_by: str,
    ) -> Department:
        data = payload.model_dump(exclude_none=True)

        data.pop("is_active", None)
        data["department_code"] = department_code

        department = Department(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(department)
        await self.db.commit()
        await self.db.refresh(department)
        return department

    async def update(
        self,
        department: Department,
        payload: DepartmentUpdate,
        updated_by: str,
    ) -> Department:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(department, field, value)

        department.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(department)
        return department

    async def set_active_status(
        self,
        department: Department,
        is_active: bool,
        updated_by: str,
    ) -> Department:
        department.is_active = is_active
        department.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(department)
        return department

    async def permanent_delete(self, department: Department) -> None:
        await self.db.delete(department)
        await self.db.commit()

    async def has_child_records(self, department_id: int) -> bool:
        # Designation/Employee module তৈরি হলে child check add হবে।
        return False

    async def get_user_full_name_by_user_id(self, user_id: str | None) -> str | None:
        if not user_id:
            return None

        result = await self.db.execute(
            select(User.full_name).where(User.user_id == user_id)
        )
        return result.scalar_one_or_none()