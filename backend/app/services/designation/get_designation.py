from fastapi import HTTPException, status

from app.repositories.designation_repository import DesignationRepository
from app.services.designation.helpers import designation_with_user_names


async def get_designation_service(
    designation_repo: DesignationRepository,
    designation_id: int,
):
    designation = await designation_repo.get_by_id_any_status(designation_id)

    if not designation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Designation not found",
        )

    return await designation_with_user_names(designation, designation_repo)