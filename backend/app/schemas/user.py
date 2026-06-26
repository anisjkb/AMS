# E:\Audit\AMS\backend\app\schemas\user.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserMeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    email: EmailStr | None = None
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime


class UserCreate(BaseModel):
    user_id: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    email: EmailStr | None = None
    is_superuser: bool = False

    @field_validator("user_id", "full_name", "password")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field is required.")

        return value


class UserUpdate(BaseModel):
    user_id: str | None = Field(default=None, min_length=3, max_length=100)
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    email: EmailStr | None = None
    is_superuser: bool | None = None
    is_active: bool | None = None

    @field_validator("user_id", "full_name", "password")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Field cannot be empty.")

        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    email: EmailStr | None = None
    full_name: str
    is_active: bool
    is_superuser: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserMessageResponse(BaseModel):
    message: str
    data: UserResponse | None = None