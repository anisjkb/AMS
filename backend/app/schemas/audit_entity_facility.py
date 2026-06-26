from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class AuditEntityFacilityTypeBase(BaseModel):
    facility_type_code: str = Field(..., max_length=20)
    facility_type_name: str = Field(..., max_length=150)
    description: str | None = None


class AuditEntityFacilityTypeResponse(AuditEntityFacilityTypeBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityFacilityTypeListResponse(BaseModel):
    total: int
    items: list[AuditEntityFacilityTypeResponse]


class AuditEntityFacilityBase(BaseModel):
    audit_entity_id: int
    facility_type_id: int
    facility_code: str | None = Field(default=None, max_length=50)
    facility_name: str = Field(..., max_length=200)
    facility_status: str = Field(default="operational", max_length=30)
    ownership_type: str | None = Field(default=None, max_length=30)
    registration_no: str | None = Field(default=None, max_length=100)
    contact_person: str | None = Field(default=None, max_length=150)
    contact_email: EmailStr | None = Field(default=None, max_length=150)
    contact_phone: str | None = Field(default=None, max_length=50)
    address_line1: str | None = None
    address_line2: str | None = None
    division_code: str | None = Field(default=None, max_length=50)
    district_code: str | None = Field(default=None, max_length=50)
    upazila_code: str | None = Field(default=None, max_length=50)
    post_code: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default="Bangladesh", max_length=100)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    floor_area_sqft: Decimal | None = Field(default=None, ge=0)
    production_capacity: str | None = Field(default=None, max_length=150)
    number_of_employees: int | None = Field(default=None, ge=0)
    opening_date: date | None = None
    closing_date: date | None = None
    is_primary: bool = False
    is_operational: bool = True
    description: str | None = None
    remarks: str | None = None


class AuditEntityFacilityCreate(AuditEntityFacilityBase):
    pass


class AuditEntityFacilityUpdate(BaseModel):
    audit_entity_id: int | None = None
    facility_type_id: int | None = None
    facility_code: str | None = Field(default=None, max_length=50)
    facility_name: str | None = Field(default=None, max_length=200)
    facility_status: str | None = Field(default=None, max_length=30)
    ownership_type: str | None = Field(default=None, max_length=30)
    registration_no: str | None = Field(default=None, max_length=100)
    contact_person: str | None = Field(default=None, max_length=150)
    contact_email: EmailStr | None = Field(default=None, max_length=150)
    contact_phone: str | None = Field(default=None, max_length=50)
    address_line1: str | None = None
    address_line2: str | None = None
    division_code: str | None = Field(default=None, max_length=50)
    district_code: str | None = Field(default=None, max_length=50)
    upazila_code: str | None = Field(default=None, max_length=50)
    post_code: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    floor_area_sqft: Decimal | None = Field(default=None, ge=0)
    production_capacity: str | None = Field(default=None, max_length=150)
    number_of_employees: int | None = Field(default=None, ge=0)
    opening_date: date | None = None
    closing_date: date | None = None
    is_primary: bool | None = None
    is_operational: bool | None = None
    description: str | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityFacilityResponse(AuditEntityFacilityBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityFacilityListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityFacilityResponse]


class AuditEntityFacilityMessageResponse(BaseModel):
    message: str
    data: AuditEntityFacilityResponse | None = None
