from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditVisitObservationBase(BaseModel):
    issue_id: int | None = Field(default=None, gt=0)
    audit_type: str = Field(..., min_length=2, max_length=50)
    discussion_point: str = Field(..., min_length=2, max_length=255)
    observation_discussion: str = Field(..., min_length=2)
    observation_decision: str = Field(..., min_length=2)
    visit_id: int | None = Field(default=None, gt=0)
    audit_id: int | None = Field(default=None, gt=0)
    team_id: int | None = Field(default=None, gt=0)
    observation_note: str | None = None
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator(
        "audit_type",
        "discussion_point",
        "observation_discussion",
        "observation_decision",
        "status",
    )
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("observation_note")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditVisitObservationCreate(AuditVisitObservationBase):
    pass


class AuditVisitObservationUpdate(BaseModel):
    issue_id: int | None = Field(default=None, gt=0)
    audit_type: str | None = Field(default=None, min_length=2, max_length=50)
    discussion_point: str | None = Field(default=None, min_length=2, max_length=255)
    observation_discussion: str | None = Field(default=None, min_length=2)
    observation_decision: str | None = Field(default=None, min_length=2)
    visit_id: int | None = Field(default=None, gt=0)
    audit_id: int | None = Field(default=None, gt=0)
    team_id: int | None = Field(default=None, gt=0)
    observation_note: str | None = None
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator(
        "audit_type",
        "discussion_point",
        "observation_discussion",
        "observation_decision",
        "status",
    )
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("observation_note")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditVisitObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    visit_observation_id: int
    issue_id: int | None = None
    audit_type: str
    discussion_point: str
    observation_discussion: str
    observation_decision: str
    visit_id: int | None = None
    audit_id: int | None = None
    team_id: int | None = None
    observation_note: str | None = None
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditVisitObservationListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditVisitObservationResponse]


class AuditVisitObservationMessageResponse(BaseModel):
    message: str
    data: AuditVisitObservationResponse | None = None
