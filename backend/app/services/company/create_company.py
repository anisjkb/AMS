#app/services/company/create_company.py
from fastapi import HTTPException, status

from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate
from app.services.company.helpers import company_with_user_names, generate_company_code


async def create_company_service(
    company_repo: CompanyRepository,
    payload: CompanyCreate,
    created_by: str,
):
    company_code = payload.company_code

    if not company_code:
        company_code = await generate_company_code(company_repo)

    existing_code = await company_repo.get_by_code(company_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company code already exists",
        )

    existing_name = await company_repo.get_by_name(payload.company_name)
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name already exists",
        )

    if payload.company_email:
        existing_email = await company_repo.get_by_email(payload.company_email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company email already exists",
            )

    if payload.company_phone:
        existing_phone = await company_repo.get_by_phone(payload.company_phone)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company phone already exists",
            )

    company = await company_repo.create(
        payload=payload,
        company_code=company_code,
        created_by=created_by,
    )

    return {
        "message": "Company created successfully",
        "data": await company_with_user_names(company, company_repo),
    }