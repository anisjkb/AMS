# app/services/department/helpers.py

from app.models.department import Department
from app.repositories.department_repository import DepartmentRepository

async def department_with_user_names(
    department: Department,
    department_repo: DepartmentRepository,
) -> dict:
    return {
        "id": department.id,
        "department_code": department.department_code,
        "department_name": department.department_name,
        "department_short_name": department.department_short_name,
        "department_email": department.department_email,
        "department_phone": department.department_phone,
        "department_address": department.department_address,
        "company_id": department.company_id,
        "branch_id": department.branch_id,
        "remarks": department.remarks,
        "is_active": department.is_active,
        "created_by": department.created_by,
        "updated_by": department.updated_by,
        "created_at": department.created_at,
        "updated_at": department.updated_at,
        "created_by_name": await department_repo.get_user_full_name_by_user_id(
            department.created_by
        ),
        "updated_by_name": await department_repo.get_user_full_name_by_user_id(
            department.updated_by
        ),
    }

async def generate_department_code(department_repo: DepartmentRepository) -> str:
    last_department = await department_repo.get_last_department()

    if not last_department:
        return "DEP00001"

    next_id = last_department.id + 1
    return f"DEP{next_id:05d}"