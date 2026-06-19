# app/services/designation/list_designation.py
from app.repositories.designation_repository import DesignationRepository
from app.services.designation.helpers import designation_with_user_names


async def list_designations_service(
    designation_repo: DesignationRepository,
    page: int,
    page_size: int,
    search: str | None,
    company_id: int | None,
    branch_id: int | None,
    department_id: int | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
):
    total, designations = await designation_repo.list_paginated(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        branch_id=branch_id,
        department_id=department_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            await designation_with_user_names(designation, designation_repo)
            for designation in designations
        ],
    }