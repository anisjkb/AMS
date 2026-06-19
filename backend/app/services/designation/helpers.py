# E:\Audit\AMS\backend\app\services\designation\helpers.py

from app.models.designation import Designation
from app.repositories.designation_repository import DesignationRepository


async def designation_with_user_names(
    designation: Designation,
    designation_repo: DesignationRepository,
) -> dict:
    return {
        "id": designation.id,
        "designation_code": designation.designation_code,
        "designation_name": designation.designation_name,
        "designation_short_name": designation.designation_short_name,
        "company_id": designation.company_id,
        "branch_id": designation.branch_id,
        "department_id": designation.department_id,
        "remarks": designation.remarks,
        "is_active": designation.is_active,
        "created_by": designation.created_by,
        "updated_by": designation.updated_by,
        "created_at": designation.created_at,
        "updated_at": designation.updated_at,
        "created_by_name": await designation_repo.get_user_full_name_by_user_id(
            designation.created_by
        ),
        "updated_by_name": await designation_repo.get_user_full_name_by_user_id(
            designation.updated_by
        ),
    }


async def generate_designation_code(
    designation_repo: DesignationRepository,
) -> str:
    last_designation = await designation_repo.get_last_designation()

    if not last_designation:
        return "DSG00001"

    next_id = last_designation.id + 1
    return f"DSG{next_id:05d}"