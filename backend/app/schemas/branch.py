# backend/app/schemas/branch.py

import re
from datetime import datetime
from typing import Optional

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


class BranchBase(BaseModel):
    branch_name: str = Field(..., max_length=255)
    company_id: int
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None

    @field_validator("branch_phone", mode="before")
    @classmethod
    def validate_branch_phone(cls, value):
        return normalize_bd_phone(value)


class BranchCreate(BranchBase):
    branch_code: str | None = None


class BranchUpdate(BaseModel):
    branch_name: str | None = None
    company_id: int | None = None
    branch_code: str | None = None
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None
    is_active: Optional[bool] = None

    @field_validator("branch_phone", mode="before")
    @classmethod
    def validate_branch_phone(cls, value):
        return normalize_bd_phone(value)


class BranchResponse(BranchBase):
    id: int
    branch_code: str
    is_active: bool

    created_by: str | None = None
    updated_by: str | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class BranchListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[BranchResponse]


class BranchMessageResponse(BaseModel):
    message: str
    data: BranchResponse | None = None