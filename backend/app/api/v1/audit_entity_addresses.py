from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_address import (
    AuditEntityAddressCreate,
    AuditEntityAddressListResponse,
    AuditEntityAddressMessageResponse,
    AuditEntityAddressResponse,
    AuditEntityAddressTypeListResponse,
    AuditEntityAddressUpdate,
)
from app.services.audit_entity_address.audit_entity_address_service import (
    AuditEntityAddressService,
)

router = APIRouter(
    prefix="/audit-entity-addresses",
    tags=["Audit Entity Addresses"],
)


@router.get("/types", response_model=AuditEntityAddressTypeListResponse)
async def list_address_types(
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_address.view")),
):
    service = AuditEntityAddressService(db)

    return await service.list_address_types(is_active=is_active)


@router.get("", response_model=AuditEntityAddressListResponse)
async def list_addresses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    address_type_id: int | None = None,
    is_primary: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_address.view")),
):
    service = AuditEntityAddressService(db)

    return await service.list_addresses(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        address_type_id=address_type_id,
        is_primary=is_primary,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{address_id}", response_model=AuditEntityAddressResponse)
async def get_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_address.view")),
):
    service = AuditEntityAddressService(db)

    return await service.get_address(address_id)


@router.post(
    "",
    response_model=AuditEntityAddressMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_address(
    payload: AuditEntityAddressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_address.create")),
):
    service = AuditEntityAddressService(db)

    return await service.create_address(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{address_id}", response_model=AuditEntityAddressMessageResponse)
async def update_address(
    address_id: int,
    payload: AuditEntityAddressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_address.update")),
):
    service = AuditEntityAddressService(db)

    return await service.update_address(
        address_id=address_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{address_id}", response_model=AuditEntityAddressMessageResponse)
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_address.delete")),
):
    service = AuditEntityAddressService(db)

    return await service.deactivate_address(
        address_id=address_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{address_id}/restore", response_model=AuditEntityAddressMessageResponse)
async def restore_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_address.restore")),
):
    service = AuditEntityAddressService(db)

    return await service.restore_address(
        address_id=address_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{address_id}/permanent",
    response_model=AuditEntityAddressMessageResponse,
)
async def permanent_delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_address.permanent_delete")
    ),
):
    service = AuditEntityAddressService(db)

    return await service.permanent_delete_address(address_id)
