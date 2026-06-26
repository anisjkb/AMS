from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_financial_snapshot import (
    AuditEntityFinancialSnapshotCreate,
    AuditEntityFinancialSnapshotListResponse,
    AuditEntityFinancialSnapshotMessageResponse,
    AuditEntityFinancialSnapshotResponse,
    AuditEntityFinancialSnapshotUpdate,
)
from app.services.audit_entity_financial_snapshot.audit_entity_financial_snapshot_service import (
    AuditEntityFinancialSnapshotService,
)

router = APIRouter(
    prefix="/audit-entity-financial-snapshots",
    tags=["Audit Entity Financial Snapshots"],
)


@router.get("", response_model=AuditEntityFinancialSnapshotListResponse)
async def list_snapshots(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    fiscal_year: str | None = None,
    statement_type: str | None = None,
    financial_status: str | None = None,
    is_audited: bool | None = None,
    is_consolidated: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_financial_snapshot.view")
    ),
):
    service = AuditEntityFinancialSnapshotService(db)

    return await service.list_snapshots(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        fiscal_year=fiscal_year,
        statement_type=statement_type,
        financial_status=financial_status,
        is_audited=is_audited,
        is_consolidated=is_consolidated,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{snapshot_id}", response_model=AuditEntityFinancialSnapshotResponse)
async def get_snapshot(
    snapshot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_financial_snapshot.view")
    ),
):
    service = AuditEntityFinancialSnapshotService(db)

    return await service.get_snapshot(snapshot_id)


@router.post(
    "",
    response_model=AuditEntityFinancialSnapshotMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_snapshot(
    payload: AuditEntityFinancialSnapshotCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_financial_snapshot.create")
    ),
):
    service = AuditEntityFinancialSnapshotService(db)

    return await service.create_snapshot(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch(
    "/{snapshot_id}",
    response_model=AuditEntityFinancialSnapshotMessageResponse,
)
async def update_snapshot(
    snapshot_id: int,
    payload: AuditEntityFinancialSnapshotUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_financial_snapshot.update")
    ),
):
    service = AuditEntityFinancialSnapshotService(db)

    return await service.update_snapshot(
        snapshot_id=snapshot_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{snapshot_id}",
    response_model=AuditEntityFinancialSnapshotMessageResponse,
)
async def delete_snapshot(
    snapshot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_financial_snapshot.delete")
    ),
):
    service = AuditEntityFinancialSnapshotService(db)

    return await service.deactivate_snapshot(
        snapshot_id=snapshot_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{snapshot_id}/restore",
    response_model=AuditEntityFinancialSnapshotMessageResponse,
)
async def restore_snapshot(
    snapshot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_financial_snapshot.restore")
    ),
):
    service = AuditEntityFinancialSnapshotService(db)

    return await service.restore_snapshot(
        snapshot_id=snapshot_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{snapshot_id}/permanent",
    response_model=AuditEntityFinancialSnapshotMessageResponse,
)
async def permanent_delete_snapshot(
    snapshot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_financial_snapshot.permanent_delete")
    ),
):
    service = AuditEntityFinancialSnapshotService(db)

    return await service.permanent_delete_snapshot(snapshot_id)
