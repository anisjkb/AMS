from fastapi import HTTPException

from app.repositories.designation_repository import DesignationRepository
from app.services.designation.helpers import designation_with_user_names


async def deactivate_designation_service(
    designation_repo: DesignationRepository,
    designation_id: int,
    updated_by: str,
):
    designation = await designation_repo.get_by_id_any_status(designation_id)

    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")

    designation = await designation_repo.set_active_status(
        designation=designation,
        is_active=False,
        updated_by=updated_by,
    )

    return {
        "message": "Designation deleted successfully",
        "data": await designation_with_user_names(designation, designation_repo),
    }