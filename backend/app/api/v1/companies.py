# backend/app/api/v1/companies.py
from fastapi import APIRouter, Depends, Query,status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.company import (
    CompanyCreate,
    CompanyListResponse,
    CompanyMessageResponse,
    CompanyResponse,
    CompanyUpdate,
)
from app.services.company.company_service import CompanyService

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=CompanyListResponse)
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.company.view")),
):
    service = CompanyService(db)
    return await service.list_companies(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.company.view")),
):
    service = CompanyService(db)
    return await service.get_company(company_id)


@router.post("", response_model=CompanyMessageResponse,status_code=status.HTTP_201_CREATED,)
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.create")),
):
    service = CompanyService(db)
    return await service.create_company(
        payload=payload,
        created_by=current_user.user_id,
    )

#PATCH decorator replace:
@router.patch("/{company_id}", response_model=CompanyMessageResponse)
async def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.update")),
):
    service = CompanyService(db)
    return await service.update_company(
        company_id=company_id,
        payload=payload,
        updated_by=current_user.user_id,
    )

#DELETE decorator replace:
@router.delete("/{company_id}", response_model=CompanyMessageResponse)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.delete")),
):
    service = CompanyService(db)
    return await service.deactivate_company(
        company_id=company_id,
        updated_by=current_user.user_id,
    )

#Restore decorator replace:
@router.patch("/{company_id}/restore", response_model=CompanyMessageResponse)
async def restore_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.restore")),
):
    service = CompanyService(db)
    return await service.restore_company(
        company_id=company_id,
        updated_by=current_user.user_id,
    )

#Permanent delete decorator:
@router.delete("/{company_id}/permanent")
async def permanent_delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.permanent_delete")),
):
    service = CompanyService(db)
    return await service.permanent_delete_company(company_id)