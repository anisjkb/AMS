#app/services/company/update_company.py

from fastapi import HTTPException

from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyUpdate
from app.services.company.helpers import company_with_user_names


async def update_company_service(
    company_repo: CompanyRepository,
    company_id: int,
    payload: CompanyUpdate,
    updated_by: str,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if payload.company_name and payload.company_name != company.company_name:
        existing_name = await company_repo.get_by_name(payload.company_name)
        if existing_name:
            raise HTTPException(status_code=400, detail="Company name already exists")

    if payload.company_email and payload.company_email != company.company_email:
        existing_email = await company_repo.get_by_email(payload.company_email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Company email already exists")

    if payload.company_phone and payload.company_phone != company.company_phone:
        existing_phone = await company_repo.get_by_phone(payload.company_phone)
        if existing_phone:
            raise HTTPException(status_code=400, detail="Company phone already exists")

    updated_company = await company_repo.update(
        company=company,
        payload=payload,
        updated_by=updated_by,
    )

    return {
        "message": "Company updated successfully",
        "data": await company_with_user_names(updated_company, company_repo),
    }