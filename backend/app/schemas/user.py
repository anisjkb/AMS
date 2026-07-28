# E:\Audit\AMS\backend\app\schemas\user.py

import re

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


LOGIN_ID_REGEX = re.compile(r"^[A-Za-z0-9]+$")


class UserMeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    employee_id: int | None = None
    email: EmailStr | None = None
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: str = Field(
        ...,
        min_length=3,
        max_length=100,
    )
    employee_id: int = Field(..., gt=0)
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )
    is_superuser: bool = False

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Login ID is required.")

        if not LOGIN_ID_REGEX.fullmatch(value):
            raise ValueError(
                "Login ID can contain English letters "
                "and numbers only."
            )

        return value

    @field_validator("password")
    @classmethod
    def clean_required_password(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Password is required.")

        return value


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    password: str | None = Field(
        default=None,
        min_length=8,
        max_length=128,
    )
    is_superuser: bool | None = None
    is_active: bool | None = None

    @field_validator("password")
    @classmethod
    def clean_optional_password(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Password cannot be empty.")

        return value


class UserEmployeeOption(BaseModel):
    employee_id: int = Field(..., gt=0)
    employee_type: str
    employee_code: str
    official_employee_id: str | None = None
    employee_name: str
    email: EmailStr | None = None
    can_create_user: bool
    blocking_reason: str | None = None


class UserEmployeeOptionsResponse(BaseModel):
    employee_types: list[str] = Field(
        default_factory=list
    )
    items: list[UserEmployeeOption] = Field(
        default_factory=list
    )


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    employee_id: int | None = None
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