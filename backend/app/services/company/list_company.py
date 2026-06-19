#app/services/company/list_company.py

from app.repositories.company_repository import CompanyRepository
from app.services.company.helpers import company_with_user_names


async def list_companies_service(
    company_repo: CompanyRepository,
    page: int,
    page_size: int,
    search: str | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
):
    total, companies = await company_repo.list_paginated(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            await company_with_user_names(company, company_repo)
            for company in companies
        ],
    }