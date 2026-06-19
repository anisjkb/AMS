
# E:\Audit\AMS\backend\app\services\designation\restore_designation.py

from fastapi import HTTPException
from app.repositories.designation_repository import DesignationRepository
from app.services.designation.helpers import designation_with_user_names

async def restore_designation_service(
    designation_repo: DesignationRepository,
    designation_id: int,
    updated_by: str,
):
    designation = await designation_repo.get_by_id_any_status(designation_id)

    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")

    company = await designation_repo.get_company_by_id(designation.company_id)
    if not company:
        raise HTTPException(status_code=400, detail="Company not found or inactive")

    branch = await designation_repo.get_branch_by_id(designation.branch_id)
    if not branch:
        raise HTTPException(status_code=400, detail="Branch not found or inactive")

    if branch.company_id != designation.company_id:
        raise HTTPException(
            status_code=400,
            detail="Branch does not belong to selected company",
        )

    department = await designation_repo.get_department_by_id(designation.department_id)
    if not department:
        raise HTTPException(status_code=400, detail="Department not found or inactive")

    if (
        department.company_id != designation.company_id
        or department.branch_id != designation.branch_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Department does not belong to selected company/branch",
        )

    designation = await designation_repo.set_active_status(
        designation=designation,
        is_active=True,
        updated_by=updated_by,
    )

    return {
        "message": "Designation restored successfully",
        "data": await designation_with_user_names(designation, designation_repo),
    }