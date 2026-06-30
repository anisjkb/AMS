from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_report import (
    MeetingReportCreate,
    MeetingReportListResponse,
    MeetingReportMessageResponse,
    MeetingReportResponse,
    MeetingReportUpdate,
)
from app.services.meeting_report.meeting_report_service import MeetingReportService


router = APIRouter(prefix="/meeting-reports", tags=["Meeting Reports"])


@router.get("", response_model=MeetingReportListResponse)
async def list_meeting_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    meeting_id: int | None = None,
    audit_year: str | None = None,
    sort_by: str = "report_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_report.view")),
):
    service = MeetingReportService(db)

    return await service.list_meeting_reports(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        meeting_id=meeting_id,
        audit_year=audit_year,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{report_id}", response_model=MeetingReportResponse)
async def get_meeting_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.meeting_report.view")),
):
    service = MeetingReportService(db)
    return await service.get_meeting_report(report_id)


@router.post(
    "",
    response_model=MeetingReportMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_meeting_report(
    payload: MeetingReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_report.create")),
):
    service = MeetingReportService(db)

    return await service.create_meeting_report(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{report_id}", response_model=MeetingReportMessageResponse)
async def update_meeting_report(
    report_id: int,
    payload: MeetingReportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_report.update")),
):
    service = MeetingReportService(db)

    return await service.update_meeting_report(
        report_id=report_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{report_id}", response_model=MeetingReportMessageResponse)
async def delete_meeting_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_report.delete")),
):
    service = MeetingReportService(db)

    return await service.deactivate_meeting_report(
        report_id=report_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{report_id}/restore", response_model=MeetingReportMessageResponse)
async def restore_meeting_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.meeting_report.restore")),
):
    service = MeetingReportService(db)

    return await service.restore_meeting_report(
        report_id=report_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{report_id}/permanent",
    response_model=MeetingReportMessageResponse,
)
async def permanent_delete_meeting_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.meeting_report.permanent_delete")
    ),
):
    service = MeetingReportService(db)
    return await service.permanent_delete_meeting_report(report_id)
