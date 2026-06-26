from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_subject import (
    AuditSubjectCreate,
    AuditSubjectListResponse,
    AuditSubjectMessageResponse,
    AuditSubjectResponse,
    AuditSubjectUpdate,
)
from app.services.audit_subject.audit_subject_service import AuditSubjectService

router = APIRouter(prefix="/audit-subjects", tags=["Audit Subjects"])


@router.get("", response_model=AuditSubjectListResponse)
async def list_audit_subjects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    subject_type: str | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_subject.view")),
):
    service = AuditSubjectService(db)

    return await service.list_audit_subjects(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        subject_type=subject_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{audit_subject_id}", response_model=AuditSubjectResponse)
async def get_audit_subject(
    audit_subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.audit_subject.view")),
):
    service = AuditSubjectService(db)

    return await service.get_audit_subject(audit_subject_id)


@router.post(
    "",
    response_model=AuditSubjectMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_subject(
    payload: AuditSubjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_subject.create")),
):
    service = AuditSubjectService(db)

    return await service.create_audit_subject(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{audit_subject_id}", response_model=AuditSubjectMessageResponse)
async def update_audit_subject(
    audit_subject_id: int,
    payload: AuditSubjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_subject.update")),
):
    service = AuditSubjectService(db)

    return await service.update_audit_subject(
        audit_subject_id=audit_subject_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{audit_subject_id}", response_model=AuditSubjectMessageResponse)
async def delete_audit_subject(
    audit_subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_subject.delete")),
):
    service = AuditSubjectService(db)

    return await service.deactivate_audit_subject(
        audit_subject_id=audit_subject_id,
        updated_by=current_user.user_id,
    )


@router.patch(
    "/{audit_subject_id}/restore",
    response_model=AuditSubjectMessageResponse,
)
async def restore_audit_subject(
    audit_subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.audit_subject.restore")),
):
    service = AuditSubjectService(db)

    return await service.restore_audit_subject(
        audit_subject_id=audit_subject_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{audit_subject_id}/permanent",
    response_model=AuditSubjectMessageResponse,
)
async def permanent_delete_audit_subject(
    audit_subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_subject.permanent_delete")
    ),
):
    service = AuditSubjectService(db)

    return await service.permanent_delete_audit_subject(audit_subject_id)
