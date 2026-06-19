#app/services/company/delete_company.py
from fastapi import HTTPException

from app.repositories.company_repository import CompanyRepository
from app.services.company.helpers import company_with_user_names


async def deactivate_company_service(
    company_repo: CompanyRepository,
    company_id: int,
    updated_by: str,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company = await company_repo.set_active_status(
        company=company,
        is_active=False,
        updated_by=updated_by,
    )

    return {
        "message": "Company deleted successfully",
        "data": await company_with_user_names(company, company_repo),
    }