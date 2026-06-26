from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.legal_status import (
    LegalStatusCreate,
    LegalStatusListResponse,
    LegalStatusMessageResponse,
    LegalStatusResponse,
    LegalStatusUpdate,
)
from app.services.legal_status.legal_status_service import LegalStatusService

router = APIRouter(prefix="/legal-statuses", tags=["Legal Statuses"])


@router.get("", response_model=LegalStatusListResponse)
async def list_legal_statuses(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity.view")),
):
    service = LegalStatusService(db)

    return await service.list_legal_statuses(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{legal_status_id}", response_model=LegalStatusResponse)
async def get_legal_status(
    legal_status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_entity.view")),
):
    service = LegalStatusService(db)

    return await service.get_legal_status(legal_status_id)


@router.post(
    "",
    response_model=LegalStatusMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_legal_status(
    payload: LegalStatusCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.create")),
):
    service = LegalStatusService(db)

    return await service.create_legal_status(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{legal_status_id}", response_model=LegalStatusMessageResponse)
async def update_legal_status(
    legal_status_id: int,
    payload: LegalStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.update")),
):
    service = LegalStatusService(db)

    return await service.update_legal_status(
        legal_status_id=legal_status_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{legal_status_id}", response_model=LegalStatusMessageResponse)
async def delete_legal_status(
    legal_status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.delete")),
):
    service = LegalStatusService(db)

    return await service.deactivate_legal_status(
        legal_status_id=legal_status_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{legal_status_id}/restore",
    response_model=LegalStatusMessageResponse,
)
async def restore_legal_status(
    legal_status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_entity.restore")),
):
    service = LegalStatusService(db)

    return await service.restore_legal_status(
        legal_status_id=legal_status_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{legal_status_id}/permanent",
    response_model=LegalStatusMessageResponse,
)
async def permanent_delete_legal_status(
    legal_status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity.permanent_delete")
    ),
):
    service = LegalStatusService(db)

    return await service.permanent_delete_legal_status(legal_status_id)
