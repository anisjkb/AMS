from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_business_activity import (
    AuditEntityBusinessActivityCreate,
    AuditEntityBusinessActivityListResponse,
    AuditEntityBusinessActivityMessageResponse,
    AuditEntityBusinessActivityResponse,
    AuditEntityBusinessActivityUpdate,
)
from app.services.audit_entity_business_activity.audit_entity_business_activity_service import (
    AuditEntityBusinessActivityService,
)

router = APIRouter(
    prefix="/audit-entity-business-activities",
    tags=["Audit Entity Business Activities"],
)


@router.get("", response_model=AuditEntityBusinessActivityListResponse)
async def list_activities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    business_nature_id: int | None = None,
    business_sector_id: int | None = None,
    business_industry_id: int | None = None,
    is_primary: bool | None = None,
    risk_rating: str | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_business_activity.view")
    ),
):
    service = AuditEntityBusinessActivityService(db)

    return await service.list_activities(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        business_nature_id=business_nature_id,
        business_sector_id=business_sector_id,
        business_industry_id=business_industry_id,
        is_primary=is_primary,
        risk_rating=risk_rating,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{activity_id}", response_model=AuditEntityBusinessActivityResponse)
async def get_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_business_activity.view")
    ),
):
    service = AuditEntityBusinessActivityService(db)

    return await service.get_activity(activity_id)


@router.post(
    "",
    response_model=AuditEntityBusinessActivityMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_activity(
    payload: AuditEntityBusinessActivityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_business_activity.create")
    ),
):
    service = AuditEntityBusinessActivityService(db)

    return await service.create_activity(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch(
    "/{activity_id}",
    response_model=AuditEntityBusinessActivityMessageResponse,
)
async def update_activity(
    activity_id: int,
    payload: AuditEntityBusinessActivityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_business_activity.update")
    ),
):
    service = AuditEntityBusinessActivityService(db)

    return await service.update_activity(
        activity_id=activity_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{activity_id}",
    response_model=AuditEntityBusinessActivityMessageResponse,
)
async def delete_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_business_activity.delete")
    ),
):
    service = AuditEntityBusinessActivityService(db)

    return await service.deactivate_activity(
        activity_id=activity_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{activity_id}/restore",
    response_model=AuditEntityBusinessActivityMessageResponse,
)
async def restore_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_business_activity.restore")
    ),
):
    service = AuditEntityBusinessActivityService(db)

    return await service.restore_activity(
        activity_id=activity_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{activity_id}/permanent",
    response_model=AuditEntityBusinessActivityMessageResponse,
)
async def permanent_delete_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_business_activity.permanent_delete")
    ),
):
    service = AuditEntityBusinessActivityService(db)

    return await service.permanent_delete_activity(
        activity_id=activity_id,
        updated_by=current_user.user_id,
    )
