from fastapi import (
    APIRouter,
    Depends,
    Query,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.meeting_minute.exit_meeting_minute import (
    ExitMeetingMinuteReportResponse,
)
from app.schemas.meeting_minute.exit_meeting_workflow import (
    ExitMeetingLockReviewQueueResponse,
    ExitMeetingLockReviewRequest,
    ExitMeetingSnapshotListResponse,
    ExitMeetingSubmitForLockRequest,
    ExitMeetingSubmitForRelockRequest,
    ExitMeetingUnlockActionResponse,
    ExitMeetingUnlockRequestCreate,
    ExitMeetingUnlockReviewQueueResponse,
    ExitMeetingUnlockReviewRequest,
    ExitMeetingWorkflowActionResponse,
    ExitMeetingWorkflowEventListResponse,
    ExitMeetingWorkflowSummaryResponse,
)
from app.services.meeting_minute.exit_meeting_workflow_service import (
    ExitMeetingWorkflowService,
)


router = APIRouter(
    prefix="/exit-meeting-workflow",
    tags=[
        "Exit Meeting Maker-Checker Workflow"
    ],
)


@router.get(
    "/lock-review-queue",
    response_model=(
        ExitMeetingLockReviewQueueResponse
    ),
)
async def list_lock_review_queue(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None,
        max_length=200,
    ),
    workflow_status: str | None = Query(
        default=None,
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minute_approvals."
            "view"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await (
        service.list_lock_review_queue(
            page=page,
            page_size=page_size,
            search=search,
            workflow_status=(
                workflow_status
            ),
        )
    )


@router.get(
    "/unlock-review-queue",
    response_model=(
        ExitMeetingUnlockReviewQueueResponse
    ),
)
async def list_unlock_review_queue(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None,
        max_length=200,
    ),
    request_status: str = Query(
        default="pending",
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minute_approvals."
            "view"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await (
        service.list_unlock_review_queue(
            page=page,
            page_size=page_size,
            search=search,
            request_status=(
                request_status
            ),
        )
    )


@router.get(
    "/minutes/{minute_id}/summary",
    response_model=(
        ExitMeetingWorkflowSummaryResponse
    ),
)
async def get_workflow_summary(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minutes.view"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await service.get_workflow_summary(
        minute_id
    )


@router.get(
    "/minutes/{minute_id}/snapshots",
    response_model=(
        ExitMeetingSnapshotListResponse
    ),
)
async def list_minute_snapshots(
    minute_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minutes.view"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await service.list_snapshots(
        minute_id
    )


@router.get(
    "/minutes/{minute_id}/events",
    response_model=(
        ExitMeetingWorkflowEventListResponse
    ),
)
async def list_minute_workflow_events(
    minute_id: int,
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minutes.view"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await (
        service.list_workflow_events(
            minute_id=minute_id,
            limit=limit,
        )
    )


@router.get(
    "/snapshots/{snapshot_id}/report",
    response_model=(
        ExitMeetingMinuteReportResponse
    ),
)
async def get_verified_snapshot_report(
    snapshot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "menu.exit_meeting_minutes.view"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await (
        service.get_verified_snapshot_report(
            snapshot_id
        )
    )


@router.post(
    "/minutes/{minute_id}/submit-lock",
    response_model=(
        ExitMeetingWorkflowActionResponse
    ),
)
async def submit_minute_for_lock(
    minute_id: int,
    payload: ExitMeetingSubmitForLockRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.submit"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await service.submit_for_lock(
        minute_id=minute_id,
        payload=payload,
        submitted_by_user_id=(
            current_user.user_id
        ),
    )


@router.post(
    "/minutes/{minute_id}/review-lock",
    response_model=(
        ExitMeetingWorkflowActionResponse
    ),
)
async def review_minute_lock_submission(
    minute_id: int,
    payload: ExitMeetingLockReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.approve"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await (
        service.review_lock_submission(
            minute_id=minute_id,
            payload=payload,
            reviewed_by_user_id=(
                current_user.user_id
            ),
        )
    )


@router.post(
    "/minutes/{minute_id}/request-unlock",
    response_model=(
        ExitMeetingUnlockActionResponse
    ),
)
async def request_minute_unlock(
    minute_id: int,
    payload: ExitMeetingUnlockRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes."
            "request_unlock"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await service.request_unlock(
        minute_id=minute_id,
        payload=payload,
        requested_by_user_id=(
            current_user.user_id
        ),
    )


@router.post(
    "/unlock-requests/{request_id}/review",
    response_model=(
        ExitMeetingUnlockActionResponse
    ),
)
async def review_minute_unlock_request(
    request_id: int,
    payload: ExitMeetingUnlockReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes."
            "review_unlock"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await (
        service.review_unlock_request(
            request_id=request_id,
            payload=payload,
            reviewed_by_user_id=(
                current_user.user_id
            ),
        )
    )


@router.post(
    "/minutes/{minute_id}/submit-relock",
    response_model=(
        ExitMeetingWorkflowActionResponse
    ),
)
async def submit_minute_for_relock(
    minute_id: int,
    payload: (
        ExitMeetingSubmitForRelockRequest
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes.submit"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await service.submit_for_relock(
        minute_id=minute_id,
        payload=payload,
        submitted_by_user_id=(
            current_user.user_id
        ),
    )


@router.post(
    "/unlock-requests/{request_id}/cancel",
    response_model=(
        ExitMeetingUnlockActionResponse
    ),
)
async def cancel_minute_unlock_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission(
            "button.exit_meeting_minutes."
            "cancel_unlock"
        )
    ),
):
    service = ExitMeetingWorkflowService(
        db
    )

    return await (
        service.cancel_unlock_request(
            request_id=request_id,
            cancelled_by_user_id=(
                current_user.user_id
            ),
        )
    )
