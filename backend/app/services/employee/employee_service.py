from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.services.employee.create_employee import create_employee_service
from app.services.employee.delete_employee import deactivate_employee_service
from app.services.employee.get_employee import get_employee_service
from app.services.employee.list_employee import list_employees_service
from app.services.employee.permanent_delete_employee import (
    permanent_delete_employee_service,
)
from app.services.employee.restore_employee import restore_employee_service
from app.services.employee.update_employee import update_employee_service
from fastapi import UploadFile
from app.services.employee.photo_employee import (
    delete_employee_photo_service,
    upload_employee_photo_service,
)

class EmployeeService:
    def __init__(self, db: AsyncSession):
        self.employee_repo = EmployeeRepository(db)

    async def list_employees(
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
        return await list_employees_service(
            employee_repo=self.employee_repo,
            page=page,
            page_size=page_size,
            search=search,
            company_id=company_id,
            branch_id=branch_id,
            department_id=department_id,
            designation_id=designation_id,
            employee_type=employee_type,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_employee(self, employee_id: int):
        return await get_employee_service(
            employee_repo=self.employee_repo,
            employee_id=employee_id,
        )

    async def create_employee(self, payload: EmployeeCreate, created_by: str):
        return await create_employee_service(
            employee_repo=self.employee_repo,
            payload=payload,
            created_by=created_by,
        )

    async def update_employee(
        self,
        employee_id: int,
        payload: EmployeeUpdate,
        updated_by: str,
    ):
        return await update_employee_service(
            employee_repo=self.employee_repo,
            employee_id=employee_id,
            payload=payload,
            updated_by=updated_by,
        )

    async def deactivate_employee(self, employee_id: int, updated_by: str):
        return await deactivate_employee_service(
            employee_repo=self.employee_repo,
            employee_id=employee_id,
            updated_by=updated_by,
        )

    async def restore_employee(self, employee_id: int, updated_by: str):
        return await restore_employee_service(
            employee_repo=self.employee_repo,
            employee_id=employee_id,
            updated_by=updated_by,
        )

    async def permanent_delete_employee(self, employee_id: int):
        return await permanent_delete_employee_service(
            employee_repo=self.employee_repo,
            employee_id=employee_id,
        )
        
    async def upload_employee_photo(
        self,
        employee_id: int,
        file: UploadFile,
        updated_by: str,
    ):
        return await upload_employee_photo_service(
            employee_repo=self.employee_repo,
            employee_id=employee_id,
            file=file,
            updated_by=updated_by,
        )

    async def delete_employee_photo(self, employee_id: int, updated_by: str):
        return await delete_employee_photo_service(
            employee_repo=self.employee_repo,
            employee_id=employee_id,
            updated_by=updated_by,
        )