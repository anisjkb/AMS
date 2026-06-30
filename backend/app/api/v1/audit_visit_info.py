from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_visit_info import (
    AuditVisitInfoCreate,
    AuditVisitInfoListResponse,
    AuditVisitInfoMessageResponse,
    AuditVisitInfoResponse,
    AuditVisitInfoUpdate,
)
from app.services.audit_visit_info.audit_visit_info_service import (
    AuditVisitInfoService,
)


router = APIRouter(prefix="/audit-visit-info", tags=["Audit Visit Info"])


@router.get("", response_model=AuditVisitInfoListResponse)
async def list_audit_visit_info(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_id: int | None = None,
    team_id: int | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "visit_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_visit_info.view")),
):
    service = AuditVisitInfoService(db)

    return await service.list_audit_visit_info(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_id=audit_id,
        team_id=team_id,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{visit_id}", response_model=AuditVisitInfoResponse)
async def get_audit_visit_info(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_visit_info.view")),
):
    service = AuditVisitInfoService(db)
    return await service.get_audit_visit_info(visit_id)


@router.post(
    "",
    response_model=AuditVisitInfoMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_visit_info(
    payload: AuditVisitInfoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_visit_info.create")),
):
    service = AuditVisitInfoService(db)

    return await service.create_audit_visit_info(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{visit_id}", response_model=AuditVisitInfoMessageResponse)
async def update_audit_visit_info(
    visit_id: int,
    payload: AuditVisitInfoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_visit_info.update")),
):
    service = AuditVisitInfoService(db)

    return await service.update_audit_visit_info(
        visit_id=visit_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{visit_id}", response_model=AuditVisitInfoMessageResponse)
async def delete_audit_visit_info(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_visit_info.delete")),
):
    service = AuditVisitInfoService(db)

    return await service.deactivate_audit_visit_info(
        visit_id=visit_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{visit_id}/restore", response_model=AuditVisitInfoMessageResponse)
async def restore_audit_visit_info(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_visit_info.restore")),
):
    service = AuditVisitInfoService(db)

    return await service.restore_audit_visit_info(
        visit_id=visit_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{visit_id}/permanent",
    response_model=AuditVisitInfoMessageResponse,
)
async def permanent_delete_audit_visit_info(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_visit_info.permanent_delete")
    ),
):
    service = AuditVisitInfoService(db)
    return await service.permanent_delete_audit_visit_info(visit_id)
