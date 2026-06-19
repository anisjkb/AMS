from datetime import datetime

from alembic.environment import Optional
from pydantic import BaseModel, EmailStr, Field


class CompanyBase(BaseModel):
    company_name: str = Field(..., max_length=255)
    company_short_name: str | None = None
    company_email: EmailStr | None = None
    company_phone: str | None = None
    company_address: str | None = None
    website: str | None = None
    tax_number: str | None = None
    trade_license: str | None = None
    remarks: str | None = None


class CompanyCreate(CompanyBase):
    company_code: str | None = None


class CompanyUpdate(BaseModel):
    company_name: str | None = None
    company_short_name: str | None = None
    company_email: EmailStr | None = None
    company_phone: str | None = None
    company_address: str | None = None
    website: str | None = None
    tax_number: str | None = None
    trade_license: str | None = None
    remarks: str | None = None
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    id: int
    company_code: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None
    created_at: datetime
    updated_at: datetime


class CompanyListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[CompanyResponse]


class CompanyMessageResponse(BaseModel):
    message: str
    data: CompanyResponse | None = None