from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MeetingReportCreate(BaseModel):
    meeting_id: int = Field(..., gt=0)
    location: str | None = Field(default=None, max_length=255)

    @field_validator("location")
    @classmethod
    def clean_location(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class MeetingReportUpdate(BaseModel):
    meeting_id: int | None = Field(default=None, gt=0)
    location: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None

    @field_validator("location")
    @classmethod
    def clean_location(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class MeetingReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: int
    meeting_id: int | None = None
    meeting_type: str
    client_name: str
    audit_year: str
    meeting_date: date
    location: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MeetingReportListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[MeetingReportResponse]


class MeetingReportMessageResponse(BaseModel):
    message: str
    data: MeetingReportResponse | None = None
