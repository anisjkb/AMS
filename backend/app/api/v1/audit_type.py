from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_type import (
    AuditTypeCreate,
    AuditTypeListResponse,
    AuditTypeMessageResponse,
    AuditTypeResponse,
    AuditTypeUpdate,
)
from app.services.audit_type.audit_type_service import AuditTypeService


router = APIRouter(prefix="/audit-type", tags=["Audit Type"])


@router.get("", response_model=AuditTypeListResponse)
async def list_audit_type(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "audit_type_name",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_master.view")),
):
    service = AuditTypeService(db)

    return await service.list_audit_type(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        status=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{audit_type_id}", response_model=AuditTypeResponse)
async def get_audit_type(
    audit_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_master.view")),
):
    service = AuditTypeService(db)
    return await service.get_audit_type(audit_type_id)


@router.post(
    "",
    response_model=AuditTypeMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_type(
    payload: AuditTypeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.create")),
):
    service = AuditTypeService(db)

    return await service.create_audit_type(
        payload=payload,
        username=str(current_user.user_id),
    )


@router.patch("/{audit_type_id}", response_model=AuditTypeMessageResponse)
async def update_audit_type(
    audit_type_id: int,
    payload: AuditTypeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.update")),
):
    service = AuditTypeService(db)

    return await service.update_audit_type(
        audit_type_id=audit_type_id,
        payload=payload,
        username=str(current_user.user_id),
    )


@router.delete("/{audit_type_id}", response_model=AuditTypeMessageResponse)
async def delete_audit_type(
    audit_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.delete")),
):
    service = AuditTypeService(db)

    return await service.deactivate_audit_type(
        audit_type_id=audit_type_id,
        username=str(current_user.user_id),
    )


@router.patch("/{audit_type_id}/restore", response_model=AuditTypeMessageResponse)
async def restore_audit_type(
    audit_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_master.restore")),
):
    service = AuditTypeService(db)

    return await service.restore_audit_type(
        audit_type_id=audit_type_id,
        username=str(current_user.user_id),
    )


@router.delete(
    "/{audit_type_id}/permanent",
    response_model=AuditTypeMessageResponse,
)
async def permanent_delete_audit_type(
    audit_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_master.permanent_delete")
    ),
):
    service = AuditTypeService(db)
    return await service.permanent_delete_audit_type(audit_type_id)
