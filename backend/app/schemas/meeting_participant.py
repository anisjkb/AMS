from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MeetingParticipantBase(BaseModel):
    report_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=2, max_length=150)
    designation: str | None = Field(default=None, max_length=150)
    signature: str | None = Field(default=None, max_length=255)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Participant name is required.")
        return value

    @field_validator("designation", "signature")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class MeetingParticipantCreate(MeetingParticipantBase):
    pass


class MeetingParticipantUpdate(BaseModel):
    report_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(default=None, min_length=2, max_length=150)
    designation: str | None = Field(default=None, max_length=150)
    signature: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None

    @field_validator("name", "designation", "signature")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            return None

        return value


class MeetingParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    participant_id: int
    report_id: int
    name: str
    designation: str | None = None
    signature: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MeetingParticipantListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[MeetingParticipantResponse]


class MeetingParticipantMessageResponse(BaseModel):
    message: str
    data: MeetingParticipantResponse | None = None
