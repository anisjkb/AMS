from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

from app.schemas.meeting_minute.exit_meeting_minute import (
    ExitMeetingMinuteResponse,
)


ExitMeetingWorkflowStatus = Literal[
    "draft",
    "pending_lock_approval",
    "locked",
    "pending_unlock_approval",
    "unlocked_for_edit",
    "pending_relock_approval",
    "changes_requested",
]

ExitMeetingUnlockRequestStatus = Literal[
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "completed",
    "expired",
]

ExitMeetingEditScope = Literal[
    "minute_information",
    "participants",
    "visit_dates",
    "findings",
    "management_response",
    "chairman",
    "full_report",
]


class ExitMeetingSubmitForLockRequest(
    BaseModel
):
    submission_comment: str | None = Field(
        default=None,
        max_length=2000,
    )


class ExitMeetingLockReviewRequest(
    BaseModel
):
    decision: Literal[
        "approve",
        "request_changes",
    ]

    review_comment: str | None = Field(
        default=None,
        max_length=2000,
    )

    @field_validator("review_comment")
    @classmethod
    def validate_review_comment(
        cls,
        value: str | None,
        info: Any,
    ) -> str | None:
        decision = info.data.get("decision")

        if (
            decision == "request_changes"
            and not value
        ):
            raise ValueError(
                "Review comment is required when "
                "requesting changes."
            )

        return value


class ExitMeetingUnlockRequestCreate(
    BaseModel
):
    request_reason: str = Field(
        min_length=5,
        max_length=2000,
    )

    edit_scope: list[
        ExitMeetingEditScope
    ] = Field(
        min_length=1,
    )

    @field_validator("edit_scope")
    @classmethod
    def normalize_edit_scope(
        cls,
        value: list[
            ExitMeetingEditScope
        ],
    ) -> list[ExitMeetingEditScope]:
        unique_values = list(
            dict.fromkeys(value)
        )

        if "full_report" in unique_values:
            return ["full_report"]

        return unique_values


class ExitMeetingUnlockReviewRequest(
    BaseModel
):
    decision: Literal[
        "approve",
        "reject",
    ]

    review_comment: str | None = Field(
        default=None,
        max_length=2000,
    )

    approved_until: datetime | None = None

    @field_validator("review_comment")
    @classmethod
    def validate_review_comment(
        cls,
        value: str | None,
        info: Any,
    ) -> str | None:
        decision = info.data.get("decision")

        if decision == "reject" and not value:
            raise ValueError(
                "Review comment is required when "
                "rejecting an unlock request."
            )

        return value


class ExitMeetingSubmitForRelockRequest(
    BaseModel
):
    submission_comment: str | None = Field(
        default=None,
        max_length=2000,
    )


class ExitMeetingRequestChangesPayload(
    BaseModel
):
    review_comment: str = Field(
        min_length=3,
        max_length=2000,
    )


class ExitMeetingSnapshotResponse(
    BaseModel
):
    model_config = ConfigDict(
        from_attributes=True
    )

    snapshot_id: int
    minute_id: int
    snapshot_version: int
    snapshot_kind: str

    snapshot_data: dict[str, Any]
    snapshot_hash: str

    template_key: str | None = None
    template_version: str | None = None

    source_unlock_request_id: int | None = None

    locked_by_user_id: str | None = None
    approved_by_user_id: str | None = None
    locked_at: datetime

    lock_reason: str | None = None
    is_current: bool

    created_by: str | None = None
    created_at: datetime


class ExitMeetingSnapshotListResponse(
    BaseModel
):
    total: int
    items: list[
        ExitMeetingSnapshotResponse
    ]


class ExitMeetingUnlockRequestResponse(
    BaseModel
):
    model_config = ConfigDict(
        from_attributes=True
    )

    request_id: int
    minute_id: int

    request_status: (
        ExitMeetingUnlockRequestStatus
    )

    request_reason: str
    edit_scope: list[str] | dict[str, Any]

    requested_by_user_id: str
    requested_at: datetime

    reviewed_by_user_id: str | None = None
    reviewed_at: datetime | None = None

    review_comment: str | None = None
    approved_until: datetime | None = None

    completed_at: datetime | None = None
    cancelled_at: datetime | None = None

    is_active: bool

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class ExitMeetingUnlockRequestListResponse(
    BaseModel
):
    total: int
    page: int
    page_size: int

    items: list[
        ExitMeetingUnlockRequestResponse
    ]


class ExitMeetingWorkflowEventResponse(
    BaseModel
):
    model_config = ConfigDict(
        from_attributes=True
    )

    event_id: int
    minute_id: int

    unlock_request_id: int | None = None
    snapshot_id: int | None = None

    event_type: str
    from_status: str | None = None
    to_status: str

    event_comment: str | None = None
    event_payload: dict[str, Any] | None = None

    performed_by_user_id: str | None = None
    performed_at: datetime
    created_at: datetime


class ExitMeetingWorkflowEventListResponse(
    BaseModel
):
    total: int
    items: list[
        ExitMeetingWorkflowEventResponse
    ]


class ExitMeetingWorkflowActionResponse(
    BaseModel
):
    message: str
    data: ExitMeetingMinuteResponse


class ExitMeetingUnlockActionResponse(
    BaseModel
):
    message: str
    data: ExitMeetingUnlockRequestResponse


class ExitMeetingWorkflowSummaryResponse(
    BaseModel
):
    minute: ExitMeetingMinuteResponse

    current_snapshot: (
        ExitMeetingSnapshotResponse | None
    ) = None

    current_unlock_request: (
        ExitMeetingUnlockRequestResponse | None
    ) = None

    recent_events: list[
        ExitMeetingWorkflowEventResponse
    ] = Field(
        default_factory=list
    )


class ExitMeetingLockReviewQueueResponse(
    BaseModel
):
    total: int
    page: int
    page_size: int

    items: list[
        ExitMeetingMinuteResponse
    ]


class ExitMeetingUnlockReviewQueueItem(
    BaseModel
):
    request: (
        ExitMeetingUnlockRequestResponse
    )

    minute: ExitMeetingMinuteResponse


class ExitMeetingUnlockReviewQueueResponse(
    BaseModel
):
    total: int
    page: int
    page_size: int

    items: list[
        ExitMeetingUnlockReviewQueueItem
    ]

