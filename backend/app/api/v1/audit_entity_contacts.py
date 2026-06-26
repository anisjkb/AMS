from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_contact import (
    AuditEntityContactCreate,
    AuditEntityContactListResponse,
    AuditEntityContactMessageResponse,
    AuditEntityContactResponse,
    AuditEntityContactTypeListResponse,
    AuditEntityContactUpdate,
)
from app.services.audit_entity_contact.audit_entity_contact_service import (
    AuditEntityContactService,
)

router = APIRouter(
    prefix="/audit-entity-contacts",
    tags=["Audit Entity Contacts"],
)


@router.get("/types", response_model=AuditEntityContactTypeListResponse)
async def list_contact_types(
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_contact.view")),
):
    service = AuditEntityContactService(db)

    return await service.list_contact_types(is_active=is_active)


@router.get("", response_model=AuditEntityContactListResponse)
async def list_contacts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    contact_type_id: int | None = None,
    is_primary: bool | None = None,
    is_authorized_representative: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_contact.view")),
):
    service = AuditEntityContactService(db)

    return await service.list_contacts(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        contact_type_id=contact_type_id,
        is_primary=is_primary,
        is_authorized_representative=is_authorized_representative,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{contact_id}", response_model=AuditEntityContactResponse)
async def get_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_contact.view")),
):
    service = AuditEntityContactService(db)

    return await service.get_contact(contact_id)


@router.post(
    "",
    response_model=AuditEntityContactMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_contact(
    payload: AuditEntityContactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_contact.create")),
):
    service = AuditEntityContactService(db)

    return await service.create_contact(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{contact_id}", response_model=AuditEntityContactMessageResponse)
async def update_contact(
    contact_id: int,
    payload: AuditEntityContactUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_contact.update")),
):
    service = AuditEntityContactService(db)

    return await service.update_contact(
        contact_id=contact_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{contact_id}", response_model=AuditEntityContactMessageResponse)
async def delete_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_contact.delete")),
):
    service = AuditEntityContactService(db)

    return await service.deactivate_contact(
        contact_id=contact_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{contact_id}/restore", response_model=AuditEntityContactMessageResponse)
async def restore_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_contact.restore")),
):
    service = AuditEntityContactService(db)

    return await service.restore_contact(
        contact_id=contact_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{contact_id}/permanent",
    response_model=AuditEntityContactMessageResponse,
)
async def permanent_delete_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_contact.permanent_delete")
    ),
):
    service = AuditEntityContactService(db)

    return await service.permanent_delete_contact(contact_id)
