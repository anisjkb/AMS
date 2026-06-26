# E:\Audit\AMS\backend\app\schemas\role.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator

class RoleBase(BaseModel):
    role_name: str = Field(..., min_length=2, max_length=100)
    description: str | None = None

    @field_validator("role_name")
    @classmethod
    def clean_role_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Role name is required.")
        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    role_name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = None

    @field_validator("role_name")
    @classmethod
    def clean_role_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Role name cannot be empty.")
        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role_name: str
    description: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class RoleListResponse(BaseModel):
    items: list[RoleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class RoleMessageResponse(BaseModel):
    message: str
    data: RoleResponse | None = None