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
    AuditAcceptCompletionSaveRequest,
    AuditAcceptCompletionSaveResponse,
    AuditAcceptCompletionStateResponse,
    AuditAcceptSignerOptionsResponse,
    AuditAcceptCompletionSubmitResponse,
    AuditAcceptEngagementPartnerSignoffRequest,
    AuditAcceptEngagementPartnerSignoffResponse,
    AuditAcceptCompletionSubmitRequest,
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
    "/signer-options",
    response_model=AuditAcceptSignerOptionsResponse,
)
async def get_acceptance_signer_options(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(
        require_permission(
            "api.audit_accept_proce.view"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.get_signer_options()


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


@router.get(
    "/{audit_id}/completion",
    response_model=AuditAcceptCompletionStateResponse,
)
async def get_acceptance_completion(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(
        require_permission(
            "api.audit_accept_proce.view"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.get_completion_state(
        audit_id=audit_id
    )


@router.put(
    "/{audit_id}/completion",
    response_model=AuditAcceptCompletionSaveResponse,
)
async def save_acceptance_completion(
    audit_id: int,
    payload: AuditAcceptCompletionSaveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.audit_accept_proce.update"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.save_completion_draft(
        audit_id=audit_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.post(
    "/{audit_id}/completion/submit",
    response_model=AuditAcceptCompletionSubmitResponse,
)
async def submit_acceptance_completion(
    audit_id: int,
    payload: AuditAcceptCompletionSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.audit_accept_proce.submit"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.submit_completion(
        audit_id=audit_id,
        expected_workflow_version=(
            payload.expected_workflow_version
        ),
        submitted_by_user_id=current_user.user_id,
    )
@router.post(
    (
        "/{audit_id}/completion/signoffs/"
        "engagement-partner"
    ),
    response_model=(
        AuditAcceptEngagementPartnerSignoffResponse
    ),
)
async def sign_acceptance_engagement_partner(
    audit_id: int,
    payload: AuditAcceptEngagementPartnerSignoffRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.audit_accept_proce.sign"
        )
    ),
):
    service = AuditAcceptService(db)

    return await service.sign_engagement_partner(
        audit_id=audit_id,
        payload=payload,
        signed_by_user_id=current_user.user_id,
    )
