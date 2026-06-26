from datetime import datetime

from pydantic import BaseModel, Field


class AuditEntityBusinessActivityBase(BaseModel):
    audit_entity_id: int
    activity_name: str = Field(..., max_length=255)
    business_nature_id: int
    business_sector_id: int
    business_industry_id: int
    is_primary: bool = False
    risk_rating: str | None = Field(default=None, max_length=30)
    revenue_percentage: float | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    remarks: str | None = None


class AuditEntityBusinessActivityCreate(AuditEntityBusinessActivityBase):
    activity_code: str | None = Field(default=None, max_length=50)


class AuditEntityBusinessActivityUpdate(BaseModel):
    audit_entity_id: int | None = None
    activity_code: str | None = Field(default=None, max_length=50)
    activity_name: str | None = Field(default=None, max_length=255)
    business_nature_id: int | None = None
    business_sector_id: int | None = None
    business_industry_id: int | None = None
    is_primary: bool | None = None
    risk_rating: str | None = Field(default=None, max_length=30)
    revenue_percentage: float | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityBusinessActivityResponse(AuditEntityBusinessActivityBase):
    id: int
    activity_code: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityBusinessActivityListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityBusinessActivityResponse]


class AuditEntityBusinessActivityMessageResponse(BaseModel):
    message: str
    data: AuditEntityBusinessActivityResponse | None = None
