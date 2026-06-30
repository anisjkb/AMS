from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_master import (
    AuditMasterCreate,
    AuditMasterListResponse,
    AuditMasterMessageResponse,
    AuditMasterResponse,
    AuditMasterUpdate,
)
from app.services.audit_master.audit_master_service import AuditMasterService


router = APIRouter(prefix="/audit-master", tags=["Audit Master"])


@router.get("", response_model=AuditMasterListResponse)
async def list_audit_master(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    client_id: int | None = None,
    audit_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "audit_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_master.view")),
):
    service = AuditMasterService(db)

    return await service.list_audit_master(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        client_id=client_id,
        audit_type=audit_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{audit_id}", response_model=AuditMasterResponse)
async def get_audit_master(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_master.view")),
):
    service = AuditMasterService(db)
    return await service.get_audit_master(audit_id)


@router.post(
    "",
    response_model=AuditMasterMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_master(
    payload: AuditMasterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.create")),
):
    service = AuditMasterService(db)

    return await service.create_audit_master(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{audit_id}", response_model=AuditMasterMessageResponse)
async def update_audit_master(
    audit_id: int,
    payload: AuditMasterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.update")),
):
    service = AuditMasterService(db)

    return await service.update_audit_master(
        audit_id=audit_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{audit_id}", response_model=AuditMasterMessageResponse)
async def delete_audit_master(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.delete")),
):
    service = AuditMasterService(db)

    return await service.deactivate_audit_master(
        audit_id=audit_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{audit_id}/restore", response_model=AuditMasterMessageResponse)
async def restore_audit_master(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.restore")),
):
    service = AuditMasterService(db)

    return await service.restore_audit_master(
        audit_id=audit_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{audit_id}/permanent",
    response_model=AuditMasterMessageResponse,
)
async def permanent_delete_audit_master(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_master.permanent_delete")
    ),
):
    service = AuditMasterService(db)
    return await service.permanent_delete_audit_master(audit_id)
