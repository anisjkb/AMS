from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditTeamBase(BaseModel):
    team_name: str = Field(..., min_length=2, max_length=150)
    team_note: str | None = None
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator("team_name", "status")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("team_note")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditTeamCreate(AuditTeamBase):
    pass


class AuditTeamUpdate(BaseModel):
    team_name: str | None = Field(default=None, min_length=2, max_length=150)
    team_note: str | None = None
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator("team_name", "status")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("team_note")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditTeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_id: int
    team_name: str
    team_note: str | None = None
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditTeamListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditTeamResponse]


class AuditTeamMessageResponse(BaseModel):
    message: str
    data: AuditTeamResponse | None = None
