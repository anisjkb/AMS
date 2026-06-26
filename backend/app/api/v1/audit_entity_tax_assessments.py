from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_entity_tax_assessment import (
    AuditEntityTaxAssessmentCreate,
    AuditEntityTaxAssessmentListResponse,
    AuditEntityTaxAssessmentMessageResponse,
    AuditEntityTaxAssessmentResponse,
    AuditEntityTaxAssessmentUpdate,
)
from app.services.audit_entity_tax_assessment.audit_entity_tax_assessment_service import (
    AuditEntityTaxAssessmentService,
)

router = APIRouter(
    prefix="/audit-entity-tax-assessments",
    tags=["Audit Entity Tax Assessments"],
)


@router.get("", response_model=AuditEntityTaxAssessmentListResponse)
async def list_assessments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_entity_id: int | None = None,
    tax_year: str | None = None,
    tax_type: str | None = None,
    assessment_status: str | None = None,
    appeal_status: str | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_tax_assessment.view")
    ),
):
    service = AuditEntityTaxAssessmentService(db)

    return await service.list_assessments(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_entity_id=audit_entity_id,
        tax_year=tax_year,
        tax_type=tax_type,
        assessment_status=assessment_status,
        appeal_status=appeal_status,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{assessment_id}", response_model=AuditEntityTaxAssessmentResponse)
async def get_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_entity_tax_assessment.view")
    ),
):
    service = AuditEntityTaxAssessmentService(db)

    return await service.get_assessment(assessment_id)


@router.post(
    "",
    response_model=AuditEntityTaxAssessmentMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_assessment(
    payload: AuditEntityTaxAssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_tax_assessment.create")
    ),
):
    service = AuditEntityTaxAssessmentService(db)

    return await service.create_assessment(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch(
    "/{assessment_id}",
    response_model=AuditEntityTaxAssessmentMessageResponse,
)
async def update_assessment(
    assessment_id: int,
    payload: AuditEntityTaxAssessmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_tax_assessment.update")
    ),
):
    service = AuditEntityTaxAssessmentService(db)

    return await service.update_assessment(
        assessment_id=assessment_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{assessment_id}",
    response_model=AuditEntityTaxAssessmentMessageResponse,
)
async def delete_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_tax_assessment.delete")
    ),
):
    service = AuditEntityTaxAssessmentService(db)

    return await service.deactivate_assessment(
        assessment_id=assessment_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{assessment_id}/restore",
    response_model=AuditEntityTaxAssessmentMessageResponse,
)
async def restore_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_tax_assessment.restore")
    ),
):
    service = AuditEntityTaxAssessmentService(db)

    return await service.restore_assessment(
        assessment_id=assessment_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{assessment_id}/permanent",
    response_model=AuditEntityTaxAssessmentMessageResponse,
)
async def permanent_delete_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_entity_tax_assessment.permanent_delete")
    ),
):
    service = AuditEntityTaxAssessmentService(db)

    return await service.permanent_delete_assessment(assessment_id)
