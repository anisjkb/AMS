from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_exchange_listing import (
    AuditEntityExchangeListingCreate,
    AuditEntityExchangeListingListResponse,
    AuditEntityExchangeListingMessageResponse,
    AuditEntityExchangeListingResponse,
    AuditEntityExchangeListingUpdate,
)
from app.services.audit_entity_exchange_listing.audit_entity_exchange_listing_service import (
    AuditEntityExchangeListingService,
)

router = APIRouter(
    prefix="/audit-entity-exchange-listings",
    tags=["Audit Entity Exchange Listings"],
)


@router.get("", response_model=AuditEntityExchangeListingListResponse)
async def list_exchange_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    stock_exchange: str | None = None,
    listing_status: str | None = None,
    is_primary_listing: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_exchange_listing.view")
    ),
):
    service = AuditEntityExchangeListingService(db)

    return await service.list_exchange_listings(
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


@router.get("/{listing_id}", response_model=AuditEntityExchangeListingResponse)
async def get_exchange_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_exchange_listing.view")
    ),
):
    service = AuditEntityExchangeListingService(db)

    return await service.get_exchange_listing(listing_id)


@router.post(
    "",
    response_model=AuditEntityExchangeListingMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_exchange_listing(
    payload: AuditEntityExchangeListingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_exchange_listing.create")
    ),
):
    service = AuditEntityExchangeListingService(db)

    return await service.create_exchange_listing(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch(
    "/{listing_id}",
    response_model=AuditEntityExchangeListingMessageResponse,
)
async def update_exchange_listing(
    listing_id: int,
    payload: AuditEntityExchangeListingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_exchange_listing.update")
    ),
):
    service = AuditEntityExchangeListingService(db)

    return await service.update_exchange_listing(
        listing_id=listing_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{listing_id}",
    response_model=AuditEntityExchangeListingMessageResponse,
)
async def delete_exchange_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_exchange_listing.delete")
    ),
):
    service = AuditEntityExchangeListingService(db)

    return await service.deactivate_exchange_listing(
        listing_id=listing_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{listing_id}/restore",
    response_model=AuditEntityExchangeListingMessageResponse,
)
async def restore_exchange_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_exchange_listing.restore")
    ),
):
    service = AuditEntityExchangeListingService(db)

    return await service.restore_exchange_listing(
        listing_id=listing_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{listing_id}/permanent",
    response_model=AuditEntityExchangeListingMessageResponse,
)
async def permanent_delete_exchange_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_exchange_listing.permanent_delete")
    ),
):
    service = AuditEntityExchangeListingService(db)

    return await service.permanent_delete_exchange_listing(listing_id)
