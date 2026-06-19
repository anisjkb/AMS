# E:\Audit\AMS\backend\app\schemas\employee.py

import re
from datetime import date, datetime
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

class EmployeeBase(BaseModel):
    employee_name: str = Field(..., max_length=255)

    official_employee_id: str | None = None

    photo_url: str | None = None
    photo_thumb_url: str | None = None
    passport_photo_url: str | None = None
    photo_original_name: str | None = None
    photo_mime_type: str | None = None
    photo_size_bytes: int | None = None
    signature_url: str | None = None

    email: EmailStr | None = None
    phone: str | None = None
    nid: str | None = None

    dob: date | None = None
    joining_date: date | None = None

    gender: str | None = None
    employee_type: str = "Permanent"

    company_id: int
    branch_id: int
    department_id: int
    designation_id: int

    reporting_to_employee_id: int | None = None

    remarks: str | None = None

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, value):
        return normalize_bd_phone(value)


class EmployeeCreate(EmployeeBase):
    employee_code: str | None = None


class EmployeeUpdate(BaseModel):
    employee_name: str | None = None
    employee_code: str | None = None

    official_employee_id: str | None = None

    photo_url: str | None = None
    photo_thumb_url: str | None = None
    passport_photo_url: str | None = None
    photo_original_name: str | None = None
    photo_mime_type: str | None = None
    photo_size_bytes: int | None = None
    signature_url: str | None = None

    email: EmailStr | None = None
    phone: str | None = None
    nid: str | None = None

    dob: date | None = None
    joining_date: date | None = None

    gender: str | None = None
    employee_type: str | None = None

    company_id: int | None = None
    branch_id: int | None = None
    department_id: int | None = None
    designation_id: int | None = None

    reporting_to_employee_id: int | None = None

    remarks: str | None = None
    is_active: bool | None = None

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, value):
        return normalize_bd_phone(value)


class EmployeeResponse(EmployeeBase):
    id: int
    employee_code: str

    is_active: bool

    company_name: str | None = None
    branch_name: str | None = None
    department_name: str | None = None
    designation_name: str | None = None

    reporting_to_employee_name: str | None = None

    created_by: str | None = None
    updated_by: str | None = None

    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class EmployeeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[EmployeeResponse]


class EmployeeMessageResponse(BaseModel):
    message: str
    data: EmployeeResponse | None = None
