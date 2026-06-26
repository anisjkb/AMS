from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_facility import (
    AuditEntityFacilityCreate,
    AuditEntityFacilityListResponse,
    AuditEntityFacilityMessageResponse,
    AuditEntityFacilityResponse,
    AuditEntityFacilityTypeListResponse,
    AuditEntityFacilityUpdate,
)
from app.services.audit_entity_facility.audit_entity_facility_service import (
    AuditEntityFacilityService,
)

router = APIRouter(
    prefix="/audit-entity-facilities",
    tags=["Audit Entity Facilities / Factories"],
)


@router.get("/types", response_model=AuditEntityFacilityTypeListResponse)
async def list_facility_types(
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_facility.view")),
):
    service = AuditEntityFacilityService(db)

    return await service.list_facility_types(is_active=is_active)


@router.get("", response_model=AuditEntityFacilityListResponse)
async def list_facilities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    facility_type_id: int | None = None,
    facility_status: str | None = None,
    ownership_type: str | None = None,
    is_primary: bool | None = None,
    is_operational: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_facility.view")),
):
    service = AuditEntityFacilityService(db)

    return await service.list_facilities(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        facility_type_id=facility_type_id,
        facility_status=facility_status,
        ownership_type=ownership_type,
        is_primary=is_primary,
        is_operational=is_operational,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{facility_id}", response_model=AuditEntityFacilityResponse)
async def get_facility(
    facility_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity_facility.view")),
):
    service = AuditEntityFacilityService(db)

    return await service.get_facility(facility_id)


@router.post(
    "",
    response_model=AuditEntityFacilityMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_facility(
    payload: AuditEntityFacilityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_facility.create")),
):
    service = AuditEntityFacilityService(db)

    return await service.create_facility(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{facility_id}", response_model=AuditEntityFacilityMessageResponse)
async def update_facility(
    facility_id: int,
    payload: AuditEntityFacilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_facility.update")),
):
    service = AuditEntityFacilityService(db)

    return await service.update_facility(
        facility_id=facility_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{facility_id}", response_model=AuditEntityFacilityMessageResponse)
async def delete_facility(
    facility_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_facility.delete")),
):
    service = AuditEntityFacilityService(db)

    return await service.deactivate_facility(
        facility_id=facility_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{facility_id}/restore", response_model=AuditEntityFacilityMessageResponse)
async def restore_facility(
    facility_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity_facility.restore")),
):
    service = AuditEntityFacilityService(db)

    return await service.restore_facility(
        facility_id=facility_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{facility_id}/permanent",
    response_model=AuditEntityFacilityMessageResponse,
)
async def permanent_delete_facility(
    facility_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_facility.permanent_delete")
    ),
):
    service = AuditEntityFacilityService(db)

    return await service.permanent_delete_facility(facility_id)
