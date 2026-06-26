from datetime import date, datetime

from pydantic import BaseModel, Field


class AuditEntityExchangeListingBase(BaseModel):
    audit_entity_id: int
    stock_exchange: str = Field(default="none", max_length=30)
    trading_code: str | None = Field(default=None, max_length=100)
    scrip_code: str | None = Field(default=None, max_length=100)
    isin_code: str | None = Field(default=None, max_length=100)
    market_category: str | None = Field(default=None, max_length=50)
    listed_sector: str | None = Field(default=None, max_length=150)
    listing_date: date | None = None
    listing_status: str = Field(default="unlisted", max_length=30)
    is_primary_listing: bool = False
    remarks: str | None = None


class AuditEntityExchangeListingCreate(AuditEntityExchangeListingBase):
    listing_code: str | None = Field(default=None, max_length=50)


class AuditEntityExchangeListingUpdate(BaseModel):
    audit_entity_id: int | None = None
    listing_code: str | None = Field(default=None, max_length=50)
    stock_exchange: str | None = Field(default=None, max_length=30)
    trading_code: str | None = Field(default=None, max_length=100)
    scrip_code: str | None = Field(default=None, max_length=100)
    isin_code: str | None = Field(default=None, max_length=100)
    market_category: str | None = Field(default=None, max_length=50)
    listed_sector: str | None = Field(default=None, max_length=150)
    listing_date: date | None = None
    listing_status: str | None = Field(default=None, max_length=30)
    is_primary_listing: bool | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityExchangeListingResponse(AuditEntityExchangeListingBase):
    id: int
    listing_code: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityExchangeListingListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityExchangeListingResponse]


class AuditEntityExchangeListingMessageResponse(BaseModel):
    message: str
    data: AuditEntityExchangeListingResponse | None = None
