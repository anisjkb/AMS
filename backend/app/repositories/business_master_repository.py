from sqlalchemy import asc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business_master import (
    BusinessIndustry,
    BusinessNature,
    BusinessSector,
)


class BusinessMasterRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_natures(
        self,
        is_active: bool | None = True,
    ) -> list[BusinessNature]:
        stmt = select(BusinessNature)

        if is_active is not None:
            stmt = stmt.where(BusinessNature.is_active == is_active)

        stmt = stmt.order_by(asc(BusinessNature.nature_name))

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_sectors(
        self,
        nature_id: int | None = None,
        is_active: bool | None = True,
    ) -> list[BusinessSector]:
        stmt = select(BusinessSector)

        if nature_id is not None:
            stmt = stmt.where(BusinessSector.nature_id == nature_id)

        if is_active is not None:
            stmt = stmt.where(BusinessSector.is_active == is_active)

        stmt = stmt.order_by(asc(BusinessSector.sector_name))

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_industries(
        self,
        sector_id: int | None = None,
        is_active: bool | None = True,
    ) -> list[BusinessIndustry]:
        stmt = select(BusinessIndustry)

        if sector_id is not None:
            stmt = stmt.where(BusinessIndustry.sector_id == sector_id)

        if is_active is not None:
            stmt = stmt.where(BusinessIndustry.is_active == is_active)

        stmt = stmt.order_by(asc(BusinessIndustry.industry_name))

        result = await self.db.execute(stmt)
        return list(result.scalars().all())
