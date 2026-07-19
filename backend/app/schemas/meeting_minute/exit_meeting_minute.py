from datetime import datetime
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ExitMeetingMinuteBase(BaseModel):
    meeting_id: int = Field(..., gt=0)
    chairman_participant_id: int = Field(..., gt=0)
    status: str = Field(default="active", min_length=2, max_length=20)


class ExitMeetingMinuteCreate(ExitMeetingMinuteBase):
    pass


class ExitMeetingMinuteUpdate(BaseModel):
    meeting_id: int | None = Field(default=None, gt=0)
    chairman_participant_id: int | None = Field(default=None, gt=0)
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None


class ExitMeetingMinuteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    minute_id: int
    meeting_id: int
    chairman_participant_id: int

    status: str
    is_active: bool

    is_locked: bool
    locked_at: datetime | None = None
    locked_by_user_id: str | None = None
    template_key: str | None = None
    template_version: str | None = None
    snapshot_version: int
    snapshot_data: dict[str, Any] | None = None
    snapshot_hash: str | None = None

    workflow_status: str = "draft"
    workflow_version: int = 1
    unlock_cycle_number: int = 0

    submitted_by_user_id: str | None = None
    submitted_at: datetime | None = None

    reviewed_by_user_id: str | None = None
    reviewed_at: datetime | None = None
    review_note: str | None = None

    current_edit_scope: list[str] | None = None
    edit_approved_until: datetime | None = None

    last_workflow_by_user_id: str | None = None
    last_workflow_at: datetime | None = None

    current_snapshot_id: int | None = None
    current_unlock_request_id: int | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    meeting_name: str | None = None
    meeting_type: str | None = None
    meeting_date: date | None = None
    meeting_venue: str | None = None
    meeting_note1: str | None = None

    audit_id: int | None = None
    audit_name: str | None = None
    audit_type: str | None = None
    audit_year: str | None = None
    audit_start_date: date | None = None
    audit_end_date: date | None = None

    client_id: int | None = None
    client_code: str | None = None
    client_name: str | None = None

    chairman_name: str | None = None
    chairman_designation: str | None = None


class ExitMeetingMinuteListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[ExitMeetingMinuteResponse]


class ExitMeetingMinuteMessageResponse(BaseModel):
    message: str
    data: ExitMeetingMinuteResponse | None = None


class ExitMeetingParticipantReportItem(BaseModel):
    participant_id: int
    participant_name: str | None = None
    designation: str | None = None
    source_type: str | None = None
    source_label: str | None = None


class ExitMeetingFindingReportItem(BaseModel):
    visit_observation_id: int
    visit_id: int | None = None
    visit_date: date | None = None
    discussion_point: str | None = None
    observation_discussion: str | None = None
    observation_decision: str | None = None


class ExitMeetingMinuteReportResponse(BaseModel):
    minute: ExitMeetingMinuteResponse
    internal_participants: list[ExitMeetingParticipantReportItem]
    client_participants: list[ExitMeetingParticipantReportItem]
    visit_dates: list[date]
    findings: list[ExitMeetingFindingReportItem]
