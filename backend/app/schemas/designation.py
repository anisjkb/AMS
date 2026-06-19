# E:\Audit\AMS\backend\app\schemas\designation.py

from datetime import datetime
from pydantic import BaseModel, Field

class DesignationBase(BaseModel):
    designation_name: str = Field(..., max_length=255)
    designation_short_name: str | None = Field(default=None, max_length=100)

    company_id: int
    branch_id: int
    department_id: int

    remarks: str | None = None


class DesignationCreate(DesignationBase):
    designation_code: str | None = None


class DesignationUpdate(BaseModel):
    designation_name: str | None = None
    designation_code: str | None = None
    designation_short_name: str | None = Field(default=None, max_length=100)

    company_id: int | None = None
    branch_id: int | None = None
    department_id: int | None = None

    remarks: str | None = None
    is_active: bool | None = None


class DesignationResponse(DesignationBase):
    id: int
    designation_code: str
    is_active: bool

    created_by: str | None = None
    updated_by: str | None = None

    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class DesignationListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[DesignationResponse]


class DesignationMessageResponse(BaseModel):
    message: str
    data: DesignationResponse | None = None