from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class EntranceMeetingMinuteBase(BaseModel):
    meeting_id: int = Field(..., gt=0)
    chairman_participant_id: int = Field(..., gt=0)
    status: str = Field(default="active", min_length=2, max_length=20)


class EntranceMeetingMinuteCreate(EntranceMeetingMinuteBase):
    pass


class EntranceMeetingMinuteUpdate(BaseModel):
    meeting_id: int | None = Field(default=None, gt=0)
    chairman_participant_id: int | None = Field(default=None, gt=0)
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None


class EntranceMeetingMinuteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    minute_id: int
    meeting_id: int
    chairman_participant_id: int
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    meeting_name: str | None = None
    meeting_type: str | None = None
    client_id: int | None = None
    client_code: str | None = None
    client_name: str | None = None
    audit_year: str | None = None
    meeting_date: date | None = None
    audit_start_date: date | None = None
    audit_end_date: date | None = None
    meeting_venue: str | None = None
    meeting_note1: str | None = None

    chairman_name: str | None = None
    chairman_designation: str | None = None


class EntranceMeetingMinuteListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[EntranceMeetingMinuteResponse]


class EntranceMeetingMinuteMessageResponse(BaseModel):
    message: str
    data: EntranceMeetingMinuteResponse | None = None


class EntranceMeetingParticipantReportItem(BaseModel):
    participant_id: int
    participant_name: str | None = None
    designation: str | None = None
    source_type: str | None = None
    source_label: str | None = None


class EntranceMeetingDiscussionReportItem(BaseModel):
    id: int
    title: str
    description: str | None = None
    decision: str | None = None


class EntranceMeetingOfficeReportItem(BaseModel):
    label: str
    address: str | None = None


class EntranceMeetingMinuteReportResponse(BaseModel):
    minute: EntranceMeetingMinuteResponse
    internal_participants: list[EntranceMeetingParticipantReportItem]
    client_participants: list[EntranceMeetingParticipantReportItem]
    discussions: list[EntranceMeetingDiscussionReportItem]
    offices: list[EntranceMeetingOfficeReportItem]
