from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MeetingMasterBase(BaseModel):
    meeting_type: str = Field(..., min_length=2, max_length=50)
    client_id: int = Field(..., gt=0)
    client_code: str = Field(..., min_length=1, max_length=10)
    audit_year: str = Field(..., min_length=2, max_length=50)
    meeting_date: date
    audit_start_date: date
    audit_end_date: date
    meeting_venue: str = Field(..., min_length=2, max_length=255)
    meeting_note1: str = Field(..., min_length=1)
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator(
        "meeting_type",
        "client_code",
        "audit_year",
        "meeting_venue",
        "meeting_note1",
        "status",
    )
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("audit_end_date")
    @classmethod
    def validate_audit_end_date(cls, value: date, info):
        audit_start_date = info.data.get("audit_start_date")
        if audit_start_date and value < audit_start_date:
            raise ValueError("Audit end date cannot be before audit start date.")
        return value


class MeetingMasterCreate(MeetingMasterBase):
    pass


class MeetingMasterUpdate(BaseModel):
    meeting_type: str | None = Field(default=None, min_length=2, max_length=50)
    client_id: int | None = Field(default=None, gt=0)
    client_code: str | None = Field(default=None, min_length=1, max_length=10)
    audit_year: str | None = Field(default=None, min_length=2, max_length=50)
    meeting_date: date | None = None
    audit_start_date: date | None = None
    audit_end_date: date | None = None
    meeting_venue: str | None = Field(default=None, min_length=2, max_length=255)
    meeting_note1: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator(
        "meeting_type",
        "client_code",
        "audit_year",
        "meeting_venue",
        "meeting_note1",
        "status",
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")

        return value


class MeetingMasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    meeting_id: int
    meeting_type: str
    client_id: int
    client_code: str
    audit_year: str
    meeting_date: date
    audit_start_date: date
    audit_end_date: date
    meeting_venue: str
    meeting_note1: str
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MeetingMasterListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[MeetingMasterResponse]


class MeetingMasterMessageResponse(BaseModel):
    message: str
    data: MeetingMasterResponse | None = None
