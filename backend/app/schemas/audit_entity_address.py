from datetime import datetime

from pydantic import BaseModel, Field


class AuditEntityAddressTypeBase(BaseModel):
    address_type_code: str = Field(..., max_length=20)
    address_type_name: str = Field(..., max_length=150)
    description: str | None = None


class AuditEntityAddressTypeResponse(AuditEntityAddressTypeBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityAddressTypeListResponse(BaseModel):
    total: int
    items: list[AuditEntityAddressTypeResponse]


class AuditEntityAddressBase(BaseModel):
    audit_entity_id: int
    address_type_id: int
    address_line1: str | None = None
    address_line2: str | None = None
    division_code: str | None = Field(default=None, max_length=20)
    district_code: str | None = Field(default=None, max_length=20)
    upazila_code: str | None = Field(default=None, max_length=20)
    union_code: str | None = Field(default=None, max_length=20)
    post_code: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=100)
    state_region: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default="Bangladesh", max_length=100)
    is_primary: bool = False
    remarks: str | None = None


class AuditEntityAddressCreate(AuditEntityAddressBase):
    pass


class AuditEntityAddressUpdate(BaseModel):
    audit_entity_id: int | None = None
    address_type_id: int | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    division_code: str | None = Field(default=None, max_length=20)
    district_code: str | None = Field(default=None, max_length=20)
    upazila_code: str | None = Field(default=None, max_length=20)
    union_code: str | None = Field(default=None, max_length=20)
    post_code: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=100)
    state_region: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    is_primary: bool | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityAddressResponse(AuditEntityAddressBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityAddressListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityAddressResponse]


class AuditEntityAddressMessageResponse(BaseModel):
    message: str
    data: AuditEntityAddressResponse | None = None
