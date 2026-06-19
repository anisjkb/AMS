#app/services/company/get_company.py
from fastapi import HTTPException, status

from app.repositories.company_repository import CompanyRepository
from app.services.company.helpers import company_with_user_names


async def get_company_service(
    company_repo: CompanyRepository,
    company_id: int,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return await company_with_user_names(company, company_repo)