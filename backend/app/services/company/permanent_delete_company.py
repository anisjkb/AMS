#app/services/company/permanent_delete_company.py

from fastapi import HTTPException
from app.repositories.company_repository import CompanyRepository

async def permanent_delete_company_service(
    company_repo: CompanyRepository,
    company_id: int,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    has_child = await company_repo.has_child_records(company_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await company_repo.permanent_delete(company)

    return {
        "message": "Company permanently deleted successfully",
    }