# backend/app/repositories/employee_repository.py

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.branch import Branch
from app.models.company import Company
from app.models.department import Department
from app.models.designation import Designation
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


class EmployeeRepository:
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
        designation_id: int | None,
        employee_type: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(Employee)

        if company_id is not None:
            stmt = stmt.where(Employee.company_id == company_id)

        if branch_id is not None:
            stmt = stmt.where(Employee.branch_id == branch_id)

        if department_id is not None:
            stmt = stmt.where(Employee.department_id == department_id)

        if designation_id is not None:
            stmt = stmt.where(Employee.designation_id == designation_id)

        if employee_type:
            stmt = stmt.where(Employee.employee_type == employee_type)

        if is_active is not None:
            stmt = stmt.where(Employee.is_active == is_active)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Employee.employee_code.ilike(search_term),
                    Employee.official_employee_id.ilike(search_term),
                    Employee.employee_name.ilike(search_term),
                    Employee.email.ilike(search_term),
                    Employee.phone.ilike(search_term),
                    Employee.nid.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": Employee.id,
            "employee_code": Employee.employee_code,
            "employee_name": Employee.employee_name,
            "employee_type": Employee.employee_type,
            "joining_date": Employee.joining_date,
            "created_at": Employee.created_at,
            "updated_at": Employee.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Employee.id)

        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        return total or 0, list(result.scalars().all())

    async def get_by_id_any_status(self, employee_id: int) -> Employee | None:
        result = await self.db.execute(
            select(Employee).where(Employee.id == employee_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, employee_code: str) -> Employee | None:
        result = await self.db.execute(
            select(Employee).where(Employee.employee_code == employee_code)
        )
        return result.scalar_one_or_none()

    async def get_by_official_employee_id(
        self,
        official_employee_id: str,
    ) -> Employee | None:
        result = await self.db.execute(
            select(Employee).where(
                Employee.official_employee_id == official_employee_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Employee | None:
        result = await self.db.execute(
            select(Employee).where(Employee.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> Employee | None:
        result = await self.db.execute(
            select(Employee).where(Employee.phone == phone)
        )
        return result.scalar_one_or_none()

    async def get_by_nid(self, nid: str) -> Employee | None:
        result = await self.db.execute(
            select(Employee).where(Employee.nid == nid)
        )
        return result.scalar_one_or_none()

    async def get_last_employee(self) -> Employee | None:
        result = await self.db.execute(
            select(Employee).order_by(Employee.id.desc()).limit(1)
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

    async def get_designation_by_id(
        self,
        designation_id: int,
    ) -> Designation | None:
        result = await self.db.execute(
            select(Designation).where(
                Designation.id == designation_id,
                Designation.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: EmployeeCreate,
        employee_code: str,
        created_by: str,
    ) -> Employee:
        data = payload.model_dump(exclude_none=True)

        data.pop("is_active", None)
        data["employee_code"] = employee_code

        employee = Employee(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(employee)
        await self.db.commit()
        await self.db.refresh(employee)
        return employee

    async def update(
        self,
        employee: Employee,
        payload: EmployeeUpdate,
        updated_by: str,
    ) -> Employee:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(employee, field, value)

        employee.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(employee)
        return employee

    async def update_photo_fields(
        self,
        employee: Employee,
        photo_url: str | None,
        photo_thumb_url: str | None,
        passport_photo_url: str | None,
        photo_original_name: str | None,
        photo_mime_type: str | None,
        photo_size_bytes: int | None,
        updated_by: str,
    ) -> Employee:
        employee.photo_url = photo_url
        employee.photo_thumb_url = photo_thumb_url
        employee.passport_photo_url = passport_photo_url
        employee.photo_original_name = photo_original_name
        employee.photo_mime_type = photo_mime_type
        employee.photo_size_bytes = photo_size_bytes
        employee.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(employee)
        return employee

    async def set_active_status(
        self,
        employee: Employee,
        is_active: bool,
        updated_by: str,
    ) -> Employee:
        employee.is_active = is_active
        employee.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(employee)
        return employee

    async def permanent_delete(self, employee: Employee) -> None:
        await self.db.delete(employee)
        await self.db.commit()

    async def has_child_records(self, employee_id: int) -> bool:
        # Future: audit assignment, workflow approval, report sign-off check.
        return False

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

    async def get_company_name(self, company_id: int | None) -> str | None:
        if not company_id:
            return None

        result = await self.db.execute(
            select(Company.company_name).where(Company.id == company_id)
        )
        return result.scalar_one_or_none()

    async def get_branch_name(self, branch_id: int | None) -> str | None:
        if not branch_id:
            return None

        result = await self.db.execute(
            select(Branch.branch_name).where(Branch.id == branch_id)
        )
        return result.scalar_one_or_none()

    async def get_department_name(
        self,
        department_id: int | None,
    ) -> str | None:
        if not department_id:
            return None

        result = await self.db.execute(
            select(Department.department_name).where(
                Department.id == department_id
            )
        )
        return result.scalar_one_or_none()

    async def get_designation_name(
        self,
        designation_id: int | None,
    ) -> str | None:
        if not designation_id:
            return None

        result = await self.db.execute(
            select(Designation.designation_name).where(
                Designation.id == designation_id
            )
        )
        return result.scalar_one_or_none()

    async def get_employee_name(self, employee_id: int | None) -> str | None:
        if not employee_id:
            return None

        result = await self.db.execute(
            select(Employee.employee_name).where(Employee.id == employee_id)
        )
        return result.scalar_one_or_none()