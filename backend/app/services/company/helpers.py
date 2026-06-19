#app/services/company/helpers.py
from app.models.company import Company
from app.repositories.company_repository import CompanyRepository


async def company_with_user_names(
    company: Company,
    company_repo: CompanyRepository,
) -> dict:
    return {
        "id": company.id,
        "company_code": company.company_code,
        "company_name": company.company_name,
        "company_short_name": company.company_short_name,
        "company_email": company.company_email,
        "company_phone": company.company_phone,
        "company_address": company.company_address,
        "website": company.website,
        "tax_number": company.tax_number,
        "trade_license": company.trade_license,
        "remarks": company.remarks,
        "is_active": company.is_active,
        "created_by": company.created_by,
        "updated_by": company.updated_by,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "created_by_name": await company_repo.get_user_full_name_by_user_id(
            company.created_by
        ),
        "updated_by_name": await company_repo.get_user_full_name_by_user_id(
            company.updated_by
        ),
    }


async def generate_company_code(company_repo: CompanyRepository) -> str:
    last_company = await company_repo.get_last_company()

    if not last_company:
        return "COM00001"

    next_id = last_company.id + 1
    return f"COM{next_id:05d}"