#app/services/department/department_service.py
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.department_repository import DepartmentRepository
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from app.services.department.create_department import create_department_service
from app.services.department.delete_department import deactivate_department_service
from app.services.department.get_department import get_department_service
from app.services.department.list_department import list_departments_service
from app.services.department.permanent_delete_department import (
    permanent_delete_department_service,
)
from app.services.department.restore_department import restore_department_service
from app.services.department.update_department import update_department_service


class DepartmentService:
    def __init__(self, db: AsyncSession):
        self.department_repo = DepartmentRepository(db)

    async def list_departments(
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
        return await list_departments_service(
            department_repo=self.department_repo,
            page=page,
            page_size=page_size,
            search=search,
            company_id=company_id,
            branch_id=branch_id,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_department(self, department_id: int):
        return await get_department_service(
            department_repo=self.department_repo,
            department_id=department_id,
        )

    async def create_department(
        self,
        payload: DepartmentCreate,
        created_by: str,
    ):
        return await create_department_service(
            department_repo=self.department_repo,
            payload=payload,
            created_by=created_by,
        )

    async def update_department(
        self,
        department_id: int,
        payload: DepartmentUpdate,
        updated_by: str,
    ):
        return await update_department_service(
            department_repo=self.department_repo,
            department_id=department_id,
            payload=payload,
            updated_by=updated_by,
        )

    async def deactivate_department(
        self,
        department_id: int,
        updated_by: str,
    ):
        return await deactivate_department_service(
            department_repo=self.department_repo,
            department_id=department_id,
            updated_by=updated_by,
        )

    async def restore_department(
        self,
        department_id: int,
        updated_by: str,
    ):
        return await restore_department_service(
            department_repo=self.department_repo,
            department_id=department_id,
            updated_by=updated_by,
        )

    async def permanent_delete_department(self, department_id: int):
        return await permanent_delete_department_service(
            department_repo=self.department_repo,
            department_id=department_id,
        )