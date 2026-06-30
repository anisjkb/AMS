from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditVisitInfoBase(BaseModel):
    audit_id: int = Field(..., gt=0)
    team_id: int = Field(..., gt=0)
    client_address_id: int = Field(..., gt=0)
    visit_date: date
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator("status")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value


class AuditVisitInfoCreate(AuditVisitInfoBase):
    pass


class AuditVisitInfoUpdate(BaseModel):
    audit_id: int | None = Field(default=None, gt=0)
    team_id: int | None = Field(default=None, gt=0)
    client_address_id: int | None = Field(default=None, gt=0)
    visit_date: date | None = None
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator("status")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value


class AuditVisitInfoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    visit_id: int
    audit_id: int
    team_id: int
    client_address_id: int
    visit_date: date
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditVisitInfoListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditVisitInfoResponse]


class AuditVisitInfoMessageResponse(BaseModel):
    message: str
    data: AuditVisitInfoResponse | None = None
