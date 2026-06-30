from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditDiscussionIssueBase(BaseModel):
    audit_type: str = Field(..., min_length=2, max_length=50)
    discussion_point: str = Field(..., min_length=2, max_length=255)
    default_decision: str = Field(..., min_length=2)
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator("audit_type", "discussion_point", "default_decision", "status")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value


class AuditDiscussionIssueCreate(AuditDiscussionIssueBase):
    pass


class AuditDiscussionIssueUpdate(BaseModel):
    audit_type: str | None = Field(default=None, min_length=2, max_length=50)
    discussion_point: str | None = Field(default=None, min_length=2, max_length=255)
    default_decision: str | None = Field(default=None, min_length=2)
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator("audit_type", "discussion_point", "default_decision", "status")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value


class AuditDiscussionIssueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    issue_id: int
    audit_type: str
    discussion_point: str
    default_decision: str
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditDiscussionIssueListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditDiscussionIssueResponse]


class AuditDiscussionIssueMessageResponse(BaseModel):
    message: str
    data: AuditDiscussionIssueResponse | None = None
