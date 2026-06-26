from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity import (
    AuditEntityCreate,
    AuditEntityListResponse,
    AuditEntityMessageResponse,
    AuditEntityResponse,
    AuditEntityUpdate,
)
from app.services.audit_entity.audit_entity_service import AuditEntityService

router = APIRouter(prefix="/audit-entities", tags=["Audit Entities"])


@router.get("", response_model=AuditEntityListResponse)
async def list_audit_entities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    entity_type: str | None = None,
    entity_class: str | None = None,
    parent_entity_id: int | None = None,
    risk_rating: str | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity.view")),
):
    service = AuditEntityService(db)

    return await service.list_audit_entities(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        entity_type=entity_type,
        entity_class=entity_class,
        parent_entity_id=parent_entity_id,
        risk_rating=risk_rating,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{audit_entity_id}", response_model=AuditEntityResponse)
async def get_audit_entity(
    audit_entity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity.view")),
):
    service = AuditEntityService(db)

    return await service.get_audit_entity(audit_entity_id)


@router.post(
    "",
    response_model=AuditEntityMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_entity(
    payload: AuditEntityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.create")),
):
    service = AuditEntityService(db)

    return await service.create_audit_entity(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{audit_entity_id}", response_model=AuditEntityMessageResponse)
async def update_audit_entity(
    audit_entity_id: int,
    payload: AuditEntityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.update")),
):
    service = AuditEntityService(db)

    return await service.update_audit_entity(
        audit_entity_id=audit_entity_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{audit_entity_id}", response_model=AuditEntityMessageResponse)
async def delete_audit_entity(
    audit_entity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.delete")),
):
    service = AuditEntityService(db)

    return await service.deactivate_audit_entity(
        audit_entity_id=audit_entity_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{audit_entity_id}/restore",
    response_model=AuditEntityMessageResponse,
)
async def restore_audit_entity(
    audit_entity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.restore")),
):
    service = AuditEntityService(db)

    return await service.restore_audit_entity(
        audit_entity_id=audit_entity_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{audit_entity_id}/permanent",
    response_model=AuditEntityMessageResponse,
)
async def permanent_delete_audit_entity(
    audit_entity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity.permanent_delete")
    ),
):
    service = AuditEntityService(db)

    return await service.permanent_delete_audit_entity(audit_entity_id)
