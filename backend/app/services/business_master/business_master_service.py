from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.business_master_repository import BusinessMasterRepository


class BusinessMasterService:
    def __init__(self, db: AsyncSession):
        self.business_master_repo = BusinessMasterRepository(db)

    async def list_business_natures(
        self,
        is_active: bool | None = True,
    ):
        return await self.business_master_repo.list_natures(is_active=is_active)

    async def list_business_sectors(
        self,
        nature_id: int | None = None,
        is_active: bool | None = True,
    ):
        return await self.business_master_repo.list_sectors(
            nature_id=nature_id,
            is_active=is_active,
        )

    async def list_business_industries(
        self,
        sector_id: int | None = None,
        is_active: bool | None = True,
    ):
        return await self.business_master_repo.list_industries(
            sector_id=sector_id,
            is_active=is_active,
        )
