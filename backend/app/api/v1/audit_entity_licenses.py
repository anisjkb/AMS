from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_license import (
    AuditEntityLicenseCreate,
    AuditEntityLicenseListResponse,
    AuditEntityLicenseMessageResponse,
    AuditEntityLicenseResponse,
    AuditEntityLicenseTypeListResponse,
    AuditEntityLicenseUpdate,
)
from app.services.audit_entity_license.audit_entity_license_service import (
    AuditEntityLicenseService,
)

router = APIRouter(
    prefix="/audit-entity-licenses",
    tags=["Audit Entity Licenses"],
)


@router.get("/types", response_model=AuditEntityLicenseTypeListResponse)
async def list_license_types(
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_license.view")),
):
    service = AuditEntityLicenseService(db)

    return await service.list_license_types(is_active=is_active)


@router.get("", response_model=AuditEntityLicenseListResponse)
async def list_licenses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    license_type_id: int | None = None,
    license_status: str | None = None,
    is_mandatory: bool | None = None,
    is_verified: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_license.view")),
):
    service = AuditEntityLicenseService(db)

    return await service.list_licenses(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        license_type_id=license_type_id,
        license_status=license_status,
        is_mandatory=is_mandatory,
        is_verified=is_verified,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{license_id}", response_model=AuditEntityLicenseResponse)
async def get_license(
    license_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_license.view")),
):
    service = AuditEntityLicenseService(db)

    return await service.get_license(license_id)


@router.post(
    "",
    response_model=AuditEntityLicenseMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_license(
    payload: AuditEntityLicenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_license.create")),
):
    service = AuditEntityLicenseService(db)

    return await service.create_license(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{license_id}", response_model=AuditEntityLicenseMessageResponse)
async def update_license(
    license_id: int,
    payload: AuditEntityLicenseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_license.update")),
):
    service = AuditEntityLicenseService(db)

    return await service.update_license(
        license_id=license_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{license_id}", response_model=AuditEntityLicenseMessageResponse)
async def delete_license(
    license_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_license.delete")),
):
    service = AuditEntityLicenseService(db)

    return await service.deactivate_license(
        license_id=license_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{license_id}/restore", response_model=AuditEntityLicenseMessageResponse)
async def restore_license(
    license_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_license.restore")),
):
    service = AuditEntityLicenseService(db)

    return await service.restore_license(
        license_id=license_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{license_id}/permanent",
    response_model=AuditEntityLicenseMessageResponse,
)
async def permanent_delete_license(
    license_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_license.permanent_delete")
    ),
):
    service = AuditEntityLicenseService(db)

    return await service.permanent_delete_license(license_id)
