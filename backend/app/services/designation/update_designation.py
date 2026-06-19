# E:\Audit\AMS\backend\app\services\designation\update_designation.py

from fastapi import HTTPException

from app.repositories.designation_repository import DesignationRepository
from app.schemas.designation import DesignationUpdate
from app.services.designation.helpers import designation_with_user_names


async def update_designation_service(
    designation_repo: DesignationRepository,
    designation_id: int,
    payload: DesignationUpdate,
    updated_by: str,
):
    designation = await designation_repo.get_by_id_any_status(designation_id)

    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")

    target_company_id = (
        payload.company_id if payload.company_id is not None else designation.company_id
    )
    target_branch_id = (
        payload.branch_id if payload.branch_id is not None else designation.branch_id
    )
    target_department_id = (
        payload.department_id
        if payload.department_id is not None
        else designation.department_id
    )

    if payload.company_id is not None:
        company = await designation_repo.get_company_by_id(target_company_id)
        if not company:
            raise HTTPException(status_code=400, detail="Company not found or inactive")

    if (
        payload.company_id is not None
        or payload.branch_id is not None
        or payload.department_id is not None
    ):
        branch = await designation_repo.get_branch_by_id(target_branch_id)
        if not branch:
            raise HTTPException(status_code=400, detail="Branch not found or inactive")

        if branch.company_id != target_company_id:
            raise HTTPException(
                status_code=400,
                detail="Branch does not belong to selected company",
            )

        department = await designation_repo.get_department_by_id(target_department_id)
        if not department:
            raise HTTPException(
                status_code=400,
                detail="Department not found or inactive",
            )

        if (
            department.company_id != target_company_id
            or department.branch_id != target_branch_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Department does not belong to selected company/branch",
            )

    if payload.designation_code and payload.designation_code != designation.designation_code:
        existing_code = await designation_repo.get_by_code(payload.designation_code)
        if existing_code and existing_code.id != designation.id:
            raise HTTPException(status_code=400, detail="Designation code already exists")

    if payload.designation_name and (
        payload.designation_name != designation.designation_name
        or target_company_id != designation.company_id
        or target_branch_id != designation.branch_id
        or target_department_id != designation.department_id
    ):
        existing_name = await designation_repo.get_by_name_department_branch_company(
            designation_name=payload.designation_name,
            company_id=target_company_id,
            branch_id=target_branch_id,
            department_id=target_department_id,
        )
        if existing_name and existing_name.id != designation.id:
            raise HTTPException(
                status_code=400,
                detail="Designation name already exists under this department",
            )

    updated_designation = await designation_repo.update(
        designation=designation,
        payload=payload,
        updated_by=updated_by,
    )

    return {
        "message": "Designation updated successfully",
        "data": await designation_with_user_names(
            updated_designation,
            designation_repo,
        ),
    }