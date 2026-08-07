from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User

from app.schemas.audit_accept import (
    AuditAcceptConsultationCreate,
    AuditAcceptConsultationUpdate,
    AuditAcceptConsultationResponse,
    AuditConsultantEmployeeResponse,
)

from app.services.audit_accept_consultation.audit_accept_consultation_service import (
    audit_accept_consultation_service,
)


router = APIRouter(
    prefix="/audit-accept-consultation",
    tags=["Audit Accept Consultation"],
)


@router.post(
    "/",
    response_model=AuditAcceptConsultationResponse,
)
async def assign_consultation(
    payload: AuditAcceptConsultationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.consultation_management.assign"
        )
    ),
):
    return await audit_accept_consultation_service.assign_consultant(
        session=db,
        audit_id=payload.audit_id,
        completion_id=payload.completion_id,
        employee_id=payload.consultant_employee_id,
        assigned_by=current_user.user_id,
    )


@router.get(
    "/my-requests",
    response_model=list[AuditAcceptConsultationResponse],
)
async def my_consultation_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.consultation_management.view"
        )
    ),
):
    return await audit_accept_consultation_service.get_my_requests(
        db=db,
        user_id=current_user.user_id,
    )


@router.put(
    "/{consultation_id}/decision",
    response_model=AuditAcceptConsultationResponse,
)
async def consultation_decision(
    consultation_id: int,
    payload: AuditAcceptConsultationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.consultation_management.approve"
        )
    ),
):

    try:
        return await audit_accept_consultation_service.update_decision(
            db=db,
            consultation_id=consultation_id,
            decision=payload.decision,
            remarks=payload.remarks,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )






@router.get(
    "/{consultation_id}/review",
)
async def consultation_review_details(
    consultation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.consultation_management.review"
        )
    ),
):

    return await (
        audit_accept_consultation_service
        .get_review_details(
            db=db,
            consultation_id=consultation_id,
        )
    )

@router.get(
    "/management",
)
async def management_consultation_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.consultation_management.view"
        )
    ),
):

    return await (
        audit_accept_consultation_service
        .get_management_requests(
            db=db,
        )
    )

@router.get(
    "/consultants",
    response_model=list[AuditConsultantEmployeeResponse],
)
async def list_consultants(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "api.consultation_management.view"
        )
    ),
):

    return await (
        audit_accept_consultation_service
        .list_consultants(
            db=db,
        )
    )









