from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditMasterBase(BaseModel):
    client_id: int = Field(..., gt=0)
    audit_type: str = Field(..., min_length=2, max_length=50)
    audit_year: str = Field(..., min_length=2, max_length=50)
    audit_start_date: date
    audit_end_date: date
    audit_note: str = Field(..., min_length=1)
    status: str = Field(default="active", min_length=2, max_length=20)
    audit_name: str | None = Field(default=None, max_length=50)

    @field_validator("audit_type", "audit_year", "audit_note", "status")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("audit_name")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None

    @field_validator("audit_end_date")
    @classmethod
    def validate_audit_end_date(cls, value: date, info):
        audit_start_date = info.data.get("audit_start_date")
        if audit_start_date and value < audit_start_date:
            raise ValueError("Audit end date cannot be before audit start date.")
        return value


class AuditMasterCreate(AuditMasterBase):
    pass


class AuditMasterUpdate(BaseModel):
    client_id: int | None = Field(default=None, gt=0)
    audit_type: str | None = Field(default=None, min_length=2, max_length=50)
    audit_year: str | None = Field(default=None, min_length=2, max_length=50)
    audit_start_date: date | None = None
    audit_end_date: date | None = None
    audit_note: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=2, max_length=20)
    audit_name: str | None = Field(default=None, max_length=50)
    is_active: bool | None = None

    @field_validator("audit_type", "audit_year", "audit_note", "status")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator("audit_name")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditMasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    audit_id: int
    client_id: int
    audit_type: str
    audit_year: str
    audit_start_date: date
    audit_end_date: date
    audit_note: str
    status: str
    audit_name: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditMasterListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditMasterResponse]


class AuditMasterMessageResponse(BaseModel):
    message: str
    data: AuditMasterResponse | None = None
