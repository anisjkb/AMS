from fastapi import HTTPException

from app.repositories.designation_repository import DesignationRepository


async def permanent_delete_designation_service(
    designation_repo: DesignationRepository,
    designation_id: int,
):
    designation = await designation_repo.get_by_id_any_status(designation_id)

    if not designation:
        raise HTTPException(status_code=404, detail="Designation not found")

    has_child = await designation_repo.has_child_records(designation_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await designation_repo.permanent_delete(designation)

    return {
        "message": "Designation permanently deleted successfully",
    }