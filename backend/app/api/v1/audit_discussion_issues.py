from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_discussion_issue import (
    AuditDiscussionIssueCreate,
    AuditDiscussionIssueListResponse,
    AuditDiscussionIssueMessageResponse,
    AuditDiscussionIssueResponse,
    AuditDiscussionIssueUpdate,
)
from app.services.audit_discussion_issue.audit_discussion_issue_service import (
    AuditDiscussionIssueService,
)


router = APIRouter(
    prefix="/audit-discussion-issues",
    tags=["Audit Discussion Issues"],
)


@router.get("", response_model=AuditDiscussionIssueListResponse)
async def list_audit_discussion_issues(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    audit_type: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = "issue_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_discussion_issue.view")
    ),
):
    service = AuditDiscussionIssueService(db)

    return await service.list_audit_discussion_issues(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        audit_type=audit_type,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{issue_id}", response_model=AuditDiscussionIssueResponse)
async def get_audit_discussion_issue(
    issue_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_discussion_issue.view")
    ),
):
    service = AuditDiscussionIssueService(db)
    return await service.get_audit_discussion_issue(issue_id)


@router.post(
    "",
    response_model=AuditDiscussionIssueMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_audit_discussion_issue(
    payload: AuditDiscussionIssueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_discussion_issue.create")
    ),
):
    service = AuditDiscussionIssueService(db)

    return await service.create_audit_discussion_issue(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{issue_id}", response_model=AuditDiscussionIssueMessageResponse)
async def update_audit_discussion_issue(
    issue_id: int,
    payload: AuditDiscussionIssueUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_discussion_issue.update")
    ),
):
    service = AuditDiscussionIssueService(db)

    return await service.update_audit_discussion_issue(
        issue_id=issue_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{issue_id}", response_model=AuditDiscussionIssueMessageResponse)
async def delete_audit_discussion_issue(
    issue_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_discussion_issue.delete")
    ),
):
    service = AuditDiscussionIssueService(db)

    return await service.deactivate_audit_discussion_issue(
        issue_id=issue_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{issue_id}/restore", response_model=AuditDiscussionIssueMessageResponse)
async def restore_audit_discussion_issue(
    issue_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_discussion_issue.restore")
    ),
):
    service = AuditDiscussionIssueService(db)

    return await service.restore_audit_discussion_issue(
        issue_id=issue_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{issue_id}/permanent",
    response_model=AuditDiscussionIssueMessageResponse,
)
async def permanent_delete_audit_discussion_issue(
    issue_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.audit_discussion_issue.permanent_delete")
    ),
):
    service = AuditDiscussionIssueService(db)
    return await service.permanent_delete_audit_discussion_issue(issue_id)
