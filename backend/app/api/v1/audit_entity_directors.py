from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_director import (
    AuditEntityDirectorCreate,
    AuditEntityDirectorListResponse,
    AuditEntityDirectorMessageResponse,
    AuditEntityDirectorResponse,
    AuditEntityDirectorTypeListResponse,
    AuditEntityDirectorUpdate,
)
from app.services.audit_entity_director.audit_entity_director_service import (
    AuditEntityDirectorService,
)

router = APIRouter(
    prefix="/audit-entity-directors",
    tags=["Audit Entity Directors / Owners"],
)


@router.get("/types", response_model=AuditEntityDirectorTypeListResponse)
async def list_director_types(
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_director.view")),
):
    service = AuditEntityDirectorService(db)

    return await service.list_director_types(is_active=is_active)


@router.get("", response_model=AuditEntityDirectorListResponse)
async def list_directors(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    director_type_id: int | None = None,
    is_primary: bool | None = None,
    is_signatory: bool | None = None,
    is_beneficial_owner: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_director.view")),
):
    service = AuditEntityDirectorService(db)

    return await service.list_directors(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        director_type_id=director_type_id,
        is_primary=is_primary,
        is_signatory=is_signatory,
        is_beneficial_owner=is_beneficial_owner,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{director_id}", response_model=AuditEntityDirectorResponse)
async def get_director(
    director_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_director.view")),
):
    service = AuditEntityDirectorService(db)

    return await service.get_director(director_id)


@router.post(
    "",
    response_model=AuditEntityDirectorMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_director(
    payload: AuditEntityDirectorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_director.create")),
):
    service = AuditEntityDirectorService(db)

    return await service.create_director(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{director_id}", response_model=AuditEntityDirectorMessageResponse)
async def update_director(
    director_id: int,
    payload: AuditEntityDirectorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_director.update")),
):
    service = AuditEntityDirectorService(db)

    return await service.update_director(
        director_id=director_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{director_id}", response_model=AuditEntityDirectorMessageResponse)
async def delete_director(
    director_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_director.delete")),
):
    service = AuditEntityDirectorService(db)

    return await service.deactivate_director(
        director_id=director_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{director_id}/restore", response_model=AuditEntityDirectorMessageResponse)
async def restore_director(
    director_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_director.restore")),
):
    service = AuditEntityDirectorService(db)

    return await service.restore_director(
        director_id=director_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{director_id}/permanent",
    response_model=AuditEntityDirectorMessageResponse,
)
async def permanent_delete_director(
    director_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_director.permanent_delete")
    ),
):
    service = AuditEntityDirectorService(db)

    return await service.permanent_delete_director(director_id)
