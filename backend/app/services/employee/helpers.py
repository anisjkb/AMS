
# E:\Audit\AMS\backend\app\services\employee\helpers.py

from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository

async def employee_with_names(
    employee: Employee,
    employee_repo: EmployeeRepository,
) -> dict:
    return {
        "id": employee.id,
        "employee_code": employee.employee_code,
        "official_employee_id": employee.official_employee_id,
        "employee_name": employee.employee_name,
        "photo_url": employee.photo_url,
        "photo_thumb_url": employee.photo_thumb_url,
        "passport_photo_url": employee.passport_photo_url,
        "photo_original_name": employee.photo_original_name,
        "photo_mime_type": employee.photo_mime_type,
        "photo_size_bytes": employee.photo_size_bytes,
        "signature_url": employee.signature_url,
        "email": employee.email,
        "phone": employee.phone,
        "nid": employee.nid,
        "dob": employee.dob,
        "joining_date": employee.joining_date,
        "gender": employee.gender,
        "employee_type": employee.employee_type,
        "company_id": employee.company_id,
        "branch_id": employee.branch_id,
        "department_id": employee.department_id,
        "designation_id": employee.designation_id,
        "reporting_to_employee_id": employee.reporting_to_employee_id,
        "remarks": employee.remarks,
        "is_active": employee.is_active,
        "company_name": await employee_repo.get_company_name(employee.company_id),
        "branch_name": await employee_repo.get_branch_name(employee.branch_id),
        "department_name": await employee_repo.get_department_name(
            employee.department_id
        ),
        "designation_name": await employee_repo.get_designation_name(
            employee.designation_id
        ),
        "reporting_to_employee_name": await employee_repo.get_employee_name(
            employee.reporting_to_employee_id
        ),
        "created_by": employee.created_by,
        "updated_by": employee.updated_by,
        "created_by_name": await employee_repo.get_user_full_name_by_user_id(
            employee.created_by
        ),
        "updated_by_name": await employee_repo.get_user_full_name_by_user_id(
            employee.updated_by
        ),
        "created_at": employee.created_at,
        "updated_at": employee.updated_at,
    }


async def generate_employee_code(employee_repo: EmployeeRepository) -> str:
    last_employee = await employee_repo.get_last_employee()

    if not last_employee:
        return "EMP00001"

    next_id = last_employee.id + 1
    return f"EMP{next_id:05d}"