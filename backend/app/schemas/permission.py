# E:\Audit\AMS\backend\app\schemas\permission.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PermissionBase(BaseModel):
    permission_key: str = Field(..., min_length=3, max_length=150)
    resource_type: str = Field(..., min_length=2, max_length=30)
    resource_key: str = Field(..., min_length=2, max_length=100)
    action: str = Field(..., min_length=2, max_length=30)
    description: str | None = None

    @field_validator(
        "permission_key",
        "resource_type",
        "resource_key",
        "action",
    )
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field is required.")

        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    permission_key: str | None = Field(default=None, min_length=3, max_length=150)
    resource_type: str | None = Field(default=None, min_length=2, max_length=30)
    resource_key: str | None = Field(default=None, min_length=2, max_length=100)
    action: str | None = Field(default=None, min_length=2, max_length=30)
    description: str | None = None

    @field_validator(
        "permission_key",
        "resource_type",
        "resource_key",
        "action",
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    permission_key: str
    resource_type: str
    resource_key: str
    action: str
    description: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class PermissionListResponse(BaseModel):
    items: list[PermissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PermissionMessageResponse(BaseModel):
    message: str
    data: PermissionResponse | None = None