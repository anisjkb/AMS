# backend/app/schemas/department.py

import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


BD_MOBILE_REGEX = re.compile(r"^01[3-9]\d{8}$")


def normalize_bd_phone(value: str | None):
    if value is None:
        return None

    phone = str(value).strip().replace(" ", "").replace("-", "")

    if not phone:
        return None

    if phone.startswith("+880"):
        phone = "0" + phone[4:]
    elif phone.startswith("880"):
        phone = "0" + phone[3:]

    if not BD_MOBILE_REGEX.fullmatch(phone):
        raise ValueError(
            "Phone number must be a valid Bangladesh mobile number. "
            "Example: 01712345678 or +8801712345678."
        )

    return phone


class DepartmentBase(BaseModel):
    department_name: str = Field(..., max_length=255)

    company_id: int
    branch_id: int

    department_short_name: str | None = Field(default=None, max_length=100)
    department_email: EmailStr | None = None
    department_phone: str | None = None
    department_address: str | None = Field(default=None, max_length=500)

    remarks: str | None = None

    @field_validator("department_phone", mode="before")
    @classmethod
    def validate_department_phone(cls, value):
        return normalize_bd_phone(value)


class DepartmentCreate(DepartmentBase):
    department_code: str | None = None


class DepartmentUpdate(BaseModel):
    department_name: str | None = None
    department_code: str | None = None

    company_id: int | None = None
    branch_id: int | None = None

    department_short_name: str | None = Field(default=None, max_length=100)
    department_email: EmailStr | None = None
    department_phone: str | None = None
    department_address: str | None = Field(default=None, max_length=500)

    remarks: str | None = None
    is_active: bool | None = None

    @field_validator("department_phone", mode="before")
    @classmethod
    def validate_department_phone(cls, value):
        return normalize_bd_phone(value)


class DepartmentResponse(DepartmentBase):
    id: int

    department_code: str
    is_active: bool

    created_by: str | None = None
    updated_by: str | None = None

    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class DepartmentListResponse(BaseModel):
    total: int
    page: int
    page_size: int

    items: list[DepartmentResponse]


class DepartmentMessageResponse(BaseModel):
    message: str

    data: DepartmentResponse | None = None