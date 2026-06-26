from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class AuditEntityDirectorTypeBase(BaseModel):
    director_type_code: str = Field(..., max_length=20)
    director_type_name: str = Field(..., max_length=150)
    description: str | None = None


class AuditEntityDirectorTypeResponse(AuditEntityDirectorTypeBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityDirectorTypeListResponse(BaseModel):
    total: int
    items: list[AuditEntityDirectorTypeResponse]


class AuditEntityDirectorBase(BaseModel):
    audit_entity_id: int
    director_type_id: int
    person_name: str = Field(..., max_length=150)
    designation: str | None = Field(default=None, max_length=150)
    father_name: str | None = Field(default=None, max_length=150)
    mother_name: str | None = Field(default=None, max_length=150)
    spouse_name: str | None = Field(default=None, max_length=150)
    date_of_birth: date | None = None
    nationality: str | None = Field(default=None, max_length=100)
    nid_no: str | None = Field(default=None, max_length=100)
    passport_no: str | None = Field(default=None, max_length=100)
    tax_identification_no: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=50)
    mobile: str | None = Field(default=None, max_length=50)
    ownership_percentage: Decimal | None = Field(default=None, ge=0, le=100)
    appointment_date: date | None = None
    resignation_date: date | None = None
    address: str | None = None
    is_primary: bool = False
    is_signatory: bool = False
    is_beneficial_owner: bool = False
    remarks: str | None = None


class AuditEntityDirectorCreate(AuditEntityDirectorBase):
    pass


class AuditEntityDirectorUpdate(BaseModel):
    audit_entity_id: int | None = None
    director_type_id: int | None = None
    person_name: str | None = Field(default=None, max_length=150)
    designation: str | None = Field(default=None, max_length=150)
    father_name: str | None = Field(default=None, max_length=150)
    mother_name: str | None = Field(default=None, max_length=150)
    spouse_name: str | None = Field(default=None, max_length=150)
    date_of_birth: date | None = None
    nationality: str | None = Field(default=None, max_length=100)
    nid_no: str | None = Field(default=None, max_length=100)
    passport_no: str | None = Field(default=None, max_length=100)
    tax_identification_no: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=50)
    mobile: str | None = Field(default=None, max_length=50)
    ownership_percentage: Decimal | None = Field(default=None, ge=0, le=100)
    appointment_date: date | None = None
    resignation_date: date | None = None
    address: str | None = None
    is_primary: bool | None = None
    is_signatory: bool | None = None
    is_beneficial_owner: bool | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityDirectorResponse(AuditEntityDirectorBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityDirectorListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityDirectorResponse]


class AuditEntityDirectorMessageResponse(BaseModel):
    message: str
    data: AuditEntityDirectorResponse | None = None
