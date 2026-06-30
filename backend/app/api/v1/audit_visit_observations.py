from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_visit_observation import (
    AuditVisitObservationCreate,
    AuditVisitObservationListResponse,
    AuditVisitObservationMessageResponse,
    AuditVisitObservationResponse,
    AuditVisitObservationUpdate,
)
from app.services.audit_visit_observation.audit_visit_observation_service import (
    AuditVisitObservationService,
)


router = APIRouter(
    prefix="/audit-visit-observations",
    tags=["Audit Visit Observations"],
)


@router.get("", response_model=AuditVisitObservationListResponse)
async def list_audit_visit_observations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    issue_id: int | None = None,
    visit_id: int | None = None,
    audit_id: int | None = None,
    team_id: int | None = None,
    audit_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "visit_observation_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_visit_observation.view")
    ),
):
    service = AuditVisitObservationService(db)

    return await service.list_audit_visit_observations(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        issue_id=issue_id,
        visit_id=visit_id,
        audit_id=audit_id,
        team_id=team_id,
        audit_type=audit_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{visit_observation_id}", response_model=AuditVisitObservationResponse)
async def get_audit_visit_observation(
    visit_observation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_visit_observation.view")
    ),
):
    service = AuditVisitObservationService(db)
    return await service.get_audit_visit_observation(visit_observation_id)


@router.post(
    "",
    response_model=AuditVisitObservationMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_visit_observation(
    payload: AuditVisitObservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_visit_observation.create")
    ),
):
    service = AuditVisitObservationService(db)

    return await service.create_audit_visit_observation(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch(
    "/{visit_observation_id}",
    response_model=AuditVisitObservationMessageResponse,
)
async def update_audit_visit_observation(
    visit_observation_id: int,
    payload: AuditVisitObservationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_visit_observation.update")
    ),
):
    service = AuditVisitObservationService(db)

    return await service.update_audit_visit_observation(
        visit_observation_id=visit_observation_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{visit_observation_id}",
    response_model=AuditVisitObservationMessageResponse,
)
async def delete_audit_visit_observation(
    visit_observation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_visit_observation.delete")
    ),
):
    service = AuditVisitObservationService(db)

    return await service.deactivate_audit_visit_observation(
        visit_observation_id=visit_observation_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{visit_observation_id}/restore",
    response_model=AuditVisitObservationMessageResponse,
)
async def restore_audit_visit_observation(
    visit_observation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_visit_observation.restore")
    ),
):
    service = AuditVisitObservationService(db)

    return await service.restore_audit_visit_observation(
        visit_observation_id=visit_observation_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{visit_observation_id}/permanent",
    response_model=AuditVisitObservationMessageResponse,
)
async def permanent_delete_audit_visit_observation(
    visit_observation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_visit_observation.permanent_delete")
    ),
):
    service = AuditVisitObservationService(db)
    return await service.permanent_delete_audit_visit_observation(
        visit_observation_id
    )
