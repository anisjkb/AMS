from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.business_master import (
    BusinessIndustryResponse,
    BusinessNatureResponse,
    BusinessSectorResponse,
)
from app.services.business_master.business_master_service import BusinessMasterService

router = APIRouter(prefix="/business-masters", tags=["Business Masters"])


@router.get("/natures", response_model=list[BusinessNatureResponse])
async def list_business_natures(
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity.view")),
):
    service = BusinessMasterService(db)

    return await service.list_business_natures(is_active=is_active)


@router.get("/sectors", response_model=list[BusinessSectorResponse])
async def list_business_sectors(
    nature_id: int | None = None,
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity.view")),
):
    service = BusinessMasterService(db)

    return await service.list_business_sectors(
        nature_id=nature_id,
        is_active=is_active,
    )


@router.get("/industries", response_model=list[BusinessIndustryResponse])
async def list_business_industries(
    sector_id: int | None = None,
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity.view")),
):
    service = BusinessMasterService(db)

    return await service.list_business_industries(
        sector_id=sector_id,
        is_active=is_active,
    )
