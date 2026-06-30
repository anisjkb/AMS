from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditTeamMemberBase(BaseModel):
    team_id: int = Field(..., gt=0)
    member_type: str = Field(..., min_length=2, max_length=50)
    emp_id: str = Field(..., min_length=1, max_length=50)
    team_member_role: str = Field(..., min_length=2, max_length=100)
    note: str | None = None
    br_id: str | None = Field(default=None, max_length=50)
    client_id: int | None = None
    client_contact_id: int | None = None
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator("member_type", "emp_id", "team_member_role", "status")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("note", "br_id")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditTeamMemberCreate(AuditTeamMemberBase):
    pass


class AuditTeamMemberUpdate(BaseModel):
    team_id: int | None = Field(default=None, gt=0)
    member_type: str | None = Field(default=None, min_length=2, max_length=50)
    emp_id: str | None = Field(default=None, min_length=1, max_length=50)
    team_member_role: str | None = Field(default=None, min_length=2, max_length=100)
    note: str | None = None
    br_id: str | None = Field(default=None, max_length=50)
    client_id: int | None = None
    client_contact_id: int | None = None
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator("member_type", "emp_id", "team_member_role", "status")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator("note", "br_id")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditTeamMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    team_member_id: int
    team_id: int
    member_type: str
    emp_id: str
    team_member_role: str
    note: str | None = None
    br_id: str | None = None
    client_id: int | None = None
    client_contact_id: int | None = None
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditTeamMemberListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditTeamMemberResponse]


class AuditTeamMemberMessageResponse(BaseModel):
    message: str
    data: AuditTeamMemberResponse | None = None
