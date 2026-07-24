from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_accept import (
    AuditAcceptBulkSaveRequest,
    AuditAcceptPageResponse,
    AuditAcceptSelectorResponse,
    AuditAcceptSaveResponse,
)
from app.services.audit_accept.audit_accept_service import (
    AuditAcceptService,
)


router = APIRouter(
    prefix="/audit-acceptance",
    tags=["Audit Acceptance Procedures"],
)


@router.get(
    "/selector-options",
    response_model=AuditAcceptSelectorResponse,
)
async def get_audit_acceptance_selector_options(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(
        require_permission(
            "api.audit_accept_proce.view"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.get_selector_options()


@router.get(
    "/{audit_id}",
    response_model=AuditAcceptPageResponse,
)
async def get_audit_acceptance_page(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.audit_accept_proce.view"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.get_page(
        audit_id=audit_id,
    )


@router.put(
    "/{audit_id}/responses",
    response_model=AuditAcceptSaveResponse,
)
async def save_audit_acceptance_responses(
    audit_id: int,
    payload: AuditAcceptBulkSaveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.audit_accept_proce.update"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.save_responses(
        audit_id=audit_id,
        payload=payload,
        updated_by=current_user.user_id,
    )
