from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_exchange_listing import AuditEntityExchangeListing
from app.schemas.audit_entity_exchange_listing import (
    AuditEntityExchangeListingCreate,
    AuditEntityExchangeListingUpdate,
)


class AuditEntityExchangeListingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        stock_exchange: str | None,
        listing_status: str | None,
        is_primary_listing: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityExchangeListing)

        if is_active is not None:
            stmt = stmt.where(AuditEntityExchangeListing.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(
                AuditEntityExchangeListing.audit_entity_id == audit_entity_id
            )

        if stock_exchange:
            stmt = stmt.where(
                AuditEntityExchangeListing.stock_exchange == stock_exchange
            )

        if listing_status:
            stmt = stmt.where(
                AuditEntityExchangeListing.listing_status == listing_status
            )

        if is_primary_listing is not None:
            stmt = stmt.where(
                AuditEntityExchangeListing.is_primary_listing
                == is_primary_listing
            )

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityExchangeListing.listing_code.ilike(search_term),
                    AuditEntityExchangeListing.trading_code.ilike(search_term),
                    AuditEntityExchangeListing.scrip_code.ilike(search_term),
                    AuditEntityExchangeListing.isin_code.ilike(search_term),
                    AuditEntityExchangeListing.market_category.ilike(search_term),
                    AuditEntityExchangeListing.listed_sector.ilike(search_term),
                    AuditEntityExchangeListing.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityExchangeListing.id,
            "listing_code": AuditEntityExchangeListing.listing_code,
            "stock_exchange": AuditEntityExchangeListing.stock_exchange,
            "trading_code": AuditEntityExchangeListing.trading_code,
            "listing_status": AuditEntityExchangeListing.listing_status,
            "listing_date": AuditEntityExchangeListing.listing_date,
            "created_at": AuditEntityExchangeListing.created_at,
            "updated_at": AuditEntityExchangeListing.updated_at,
        }

        sort_column = allowed_sort_fields.get(
            sort_by,
            AuditEntityExchangeListing.id,
        )

        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return total or 0, items

    async def get_by_id_any_status(
        self,
        listing_id: int,
    ) -> AuditEntityExchangeListing | None:
        result = await self.db.execute(
            select(AuditEntityExchangeListing).where(
                AuditEntityExchangeListing.id == listing_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        listing_code: str,
    ) -> AuditEntityExchangeListing | None:
        result = await self.db.execute(
            select(AuditEntityExchangeListing).where(
                AuditEntityExchangeListing.listing_code == listing_code
            )
        )
        return result.scalar_one_or_none()

    async def get_by_entity_and_exchange(
        self,
        audit_entity_id: int,
        stock_exchange: str,
        exclude_id: int | None = None,
    ) -> AuditEntityExchangeListing | None:
        stmt = select(AuditEntityExchangeListing).where(
            AuditEntityExchangeListing.audit_entity_id == audit_entity_id,
            AuditEntityExchangeListing.stock_exchange == stock_exchange,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityExchangeListing.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_last_listing(self) -> AuditEntityExchangeListing | None:
        result = await self.db.execute(
            select(AuditEntityExchangeListing)
            .order_by(AuditEntityExchangeListing.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_audit_entity_by_id(
        self,
        audit_entity_id: int,
    ) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).where(AuditEntity.id == audit_entity_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityExchangeListingCreate,
        listing_code: str,
        created_by: str,
    ) -> AuditEntityExchangeListing:
        data = payload.model_dump()
        data["listing_code"] = listing_code

        listing = AuditEntityExchangeListing(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(listing)
        await self.db.commit()
        await self.db.refresh(listing)

        return listing

    async def update(
        self,
        listing: AuditEntityExchangeListing,
        payload: AuditEntityExchangeListingUpdate,
        updated_by: str,
    ) -> AuditEntityExchangeListing:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "is_primary_listing" and value is None:
                continue

            setattr(listing, field, value)

        listing.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(listing)

        return listing

    async def set_active_status(
        self,
        listing: AuditEntityExchangeListing,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityExchangeListing:
        listing.is_active = is_active
        listing.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(listing)

        return listing

    async def permanent_delete(
        self,
        listing: AuditEntityExchangeListing,
    ) -> None:
        await self.db.delete(listing)
        await self.db.commit()

    async def set_other_listings_non_primary(
        self,
        audit_entity_id: int,
        exclude_id: int,
        updated_by: str,
    ) -> None:
        result = await self.db.execute(
            select(AuditEntityExchangeListing).where(
                AuditEntityExchangeListing.audit_entity_id == audit_entity_id,
                AuditEntityExchangeListing.id != exclude_id,
                AuditEntityExchangeListing.is_primary_listing.is_(True),
            )
        )

        listings = list(result.scalars().all())

        for listing in listings:
            listing.is_primary_listing = False
            listing.updated_by = updated_by

        await self.db.commit()
