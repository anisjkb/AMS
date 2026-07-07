from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditTypeBase(BaseModel):
    audit_type_name: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(default=None)
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator("audit_type_name", "status")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("description")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditTypeCreate(AuditTypeBase):
    pass


class AuditTypeUpdate(BaseModel):
    audit_type_name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None)
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator("audit_type_name", "status")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator("description")
    @classmethod
    def clean_optional_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class AuditTypeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    audit_type_id: int
    audit_type_name: str
    description: str | None = None
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditTypeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditTypeResponse]


class AuditTypeMessageResponse(BaseModel):
    message: str
    data: AuditTypeResponse | None = None
