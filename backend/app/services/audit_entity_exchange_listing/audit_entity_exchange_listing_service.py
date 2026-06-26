from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity_exchange_listing import AuditEntityExchangeListing
from app.repositories.audit_entity_exchange_listing_repository import (
    AuditEntityExchangeListingRepository,
)
from app.schemas.audit_entity_exchange_listing import (
    AuditEntityExchangeListingCreate,
    AuditEntityExchangeListingUpdate,
)


class AuditEntityExchangeListingService:
    def __init__(self, db: AsyncSession):
        self.listing_repo = AuditEntityExchangeListingRepository(db)

    async def list_exchange_listings(
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
        total, items = await self.listing_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            stock_exchange=stock_exchange,
            listing_status=listing_status,
            is_primary_listing=is_primary_listing,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_exchange_listing(self, listing_id: int):
        listing = await self.listing_repo.get_by_id_any_status(listing_id)

        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity exchange listing not found.",
            )

        return listing

    async def create_exchange_listing(
        self,
        payload: AuditEntityExchangeListingCreate,
        created_by: str,
    ):
        await self._validate_audit_entity(payload.audit_entity_id)

        payload = self._normalize_create_payload(payload)
        self._validate_listing_rules(
            stock_exchange=payload.stock_exchange,
            trading_code=payload.trading_code,
            listing_status=payload.listing_status,
        )

        listing_code = payload.listing_code or await self._generate_listing_code()

        existing_code = await self.listing_repo.get_by_code(listing_code)

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Exchange listing code already exists.",
            )

        existing_listing = await self.listing_repo.get_by_entity_and_exchange(
            audit_entity_id=payload.audit_entity_id,
            stock_exchange=payload.stock_exchange,
        )

        if existing_listing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has a record for selected stock exchange/status.",
            )

        listing = await self.listing_repo.create(
            payload=payload,
            listing_code=listing_code,
            created_by=created_by,
        )

        if listing.is_primary_listing:
            await self._apply_primary_listing(
                listing=listing,
                updated_by=created_by,
            )

        return {
            "message": "Audit entity exchange listing created successfully.",
            "data": listing,
        }

    async def update_exchange_listing(
        self,
        listing_id: int,
        payload: AuditEntityExchangeListingUpdate,
        updated_by: str,
    ):
        listing = await self.listing_repo.get_by_id_any_status(listing_id)

        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity exchange listing not found.",
            )

        fields_set = payload.model_fields_set
        payload = self._normalize_update_payload(payload)

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else listing.audit_entity_id
        )
        next_stock_exchange = (
            payload.stock_exchange
            if "stock_exchange" in fields_set and payload.stock_exchange is not None
            else listing.stock_exchange
        )
        next_trading_code = (
            payload.trading_code
            if "trading_code" in fields_set
            else listing.trading_code
        )
        next_listing_status = (
            payload.listing_status
            if "listing_status" in fields_set and payload.listing_status is not None
            else listing.listing_status
        )
        next_is_primary = (
            payload.is_primary_listing
            if "is_primary_listing" in fields_set
            and payload.is_primary_listing is not None
            else listing.is_primary_listing
        )

        await self._validate_audit_entity(next_entity_id)

        self._validate_listing_rules(
            stock_exchange=next_stock_exchange,
            trading_code=next_trading_code,
            listing_status=next_listing_status,
        )

        if payload.listing_code and payload.listing_code != listing.listing_code:
            existing_code = await self.listing_repo.get_by_code(
                payload.listing_code
            )

            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Exchange listing code already exists.",
                )

        existing_listing = await self.listing_repo.get_by_entity_and_exchange(
            audit_entity_id=next_entity_id,
            stock_exchange=next_stock_exchange,
            exclude_id=listing.id,
        )

        if existing_listing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has a record for selected stock exchange/status.",
            )

        updated_listing = await self.listing_repo.update(
            listing=listing,
            payload=payload,
            updated_by=updated_by,
        )

        if next_is_primary:
            await self._apply_primary_listing(
                listing=updated_listing,
                updated_by=updated_by,
            )

        return {
            "message": "Audit entity exchange listing updated successfully.",
            "data": updated_listing,
        }

    async def deactivate_exchange_listing(self, listing_id: int, updated_by: str):
        listing = await self.listing_repo.get_by_id_any_status(listing_id)

        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity exchange listing not found.",
            )

        if not listing.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exchange listing is already inactive.",
            )

        listing = await self.listing_repo.set_active_status(
            listing=listing,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity exchange listing deactivated successfully.",
            "data": listing,
        }

    async def restore_exchange_listing(self, listing_id: int, updated_by: str):
        listing = await self.listing_repo.get_by_id_any_status(listing_id)

        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity exchange listing not found.",
            )

        if listing.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exchange listing is already active.",
            )

        listing = await self.listing_repo.set_active_status(
            listing=listing,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity exchange listing restored successfully.",
            "data": listing,
        }

    async def permanent_delete_exchange_listing(self, listing_id: int):
        listing = await self.listing_repo.get_by_id_any_status(listing_id)

        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity exchange listing not found.",
            )

        await self.listing_repo.permanent_delete(listing)

        return {
            "message": "Audit entity exchange listing permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(self, audit_entity_id: int) -> None:
        entity = await self.listing_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    def _normalize_create_payload(
        self,
        payload: AuditEntityExchangeListingCreate,
    ) -> AuditEntityExchangeListingCreate:
        return payload.model_copy(
            update={
                "stock_exchange": payload.stock_exchange.strip().lower(),
                "listing_status": payload.listing_status.strip().lower(),
                "trading_code": self._clean_upper(payload.trading_code),
                "scrip_code": self._clean_upper(payload.scrip_code),
                "isin_code": self._clean_upper(payload.isin_code),
                "market_category": self._clean_upper(payload.market_category),
            }
        )

    def _normalize_update_payload(
        self,
        payload: AuditEntityExchangeListingUpdate,
    ) -> AuditEntityExchangeListingUpdate:
        update_data = {}

        if payload.stock_exchange is not None:
            update_data["stock_exchange"] = payload.stock_exchange.strip().lower()

        if payload.listing_status is not None:
            update_data["listing_status"] = payload.listing_status.strip().lower()

        if payload.trading_code is not None:
            update_data["trading_code"] = self._clean_upper(payload.trading_code)

        if payload.scrip_code is not None:
            update_data["scrip_code"] = self._clean_upper(payload.scrip_code)

        if payload.isin_code is not None:
            update_data["isin_code"] = self._clean_upper(payload.isin_code)

        if payload.market_category is not None:
            update_data["market_category"] = self._clean_upper(
                payload.market_category
            )

        return payload.model_copy(update=update_data)

    def _clean_upper(self, value: str | None) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()

        if not cleaned:
            return None

        return cleaned.upper()

    def _validate_listing_rules(
        self,
        stock_exchange: str,
        trading_code: str | None,
        listing_status: str,
    ) -> None:
        allowed_exchanges = {"none", "dse", "cse", "other"}
        allowed_statuses = {"unlisted", "listed", "suspended", "delisted"}

        if stock_exchange not in allowed_exchanges:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock exchange must be one of: none, dse, cse, other.",
            )

        if listing_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Listing status must be one of: unlisted, listed, suspended, delisted.",
            )

        if listing_status == "unlisted" and stock_exchange != "none":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unlisted company must use stock exchange: none.",
            )

        if stock_exchange == "none" and listing_status != "unlisted":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock exchange none can only be used for unlisted status.",
            )

        if stock_exchange in {"dse", "cse"} and not trading_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trading code is required for DSE or CSE record.",
            )

    async def _apply_primary_listing(
        self,
        listing: AuditEntityExchangeListing,
        updated_by: str,
    ) -> None:
        await self.listing_repo.set_other_listings_non_primary(
            audit_entity_id=listing.audit_entity_id,
            exclude_id=listing.id,
            updated_by=updated_by,
        )

    async def _generate_listing_code(self) -> str:
        last_listing = await self.listing_repo.get_last_listing()

        if not last_listing:
            return "EXL-0001"

        next_id = last_listing.id + 1

        return f"EXL-{next_id:04d}"
