from datetime import date, datetime

from pydantic import BaseModel, Field


class AuditEntityLicenseTypeBase(BaseModel):
    license_type_code: str = Field(..., max_length=20)
    license_type_name: str = Field(..., max_length=150)
    description: str | None = None


class AuditEntityLicenseTypeResponse(AuditEntityLicenseTypeBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityLicenseTypeListResponse(BaseModel):
    total: int
    items: list[AuditEntityLicenseTypeResponse]


class AuditEntityLicenseBase(BaseModel):
    audit_entity_id: int
    license_type_id: int
    license_no: str = Field(..., max_length=150)
    license_name: str | None = Field(default=None, max_length=200)
    issuing_authority: str | None = Field(default=None, max_length=200)
    issuing_country: str | None = Field(default="Bangladesh", max_length=100)
    issue_date: date | None = None
    expiry_date: date | None = None
    renewal_due_date: date | None = None
    license_status: str = Field(default="valid", max_length=30)
    document_reference: str | None = Field(default=None, max_length=255)
    is_mandatory: bool = False
    is_verified: bool = False
    remarks: str | None = None


class AuditEntityLicenseCreate(AuditEntityLicenseBase):
    pass


class AuditEntityLicenseUpdate(BaseModel):
    audit_entity_id: int | None = None
    license_type_id: int | None = None
    license_no: str | None = Field(default=None, max_length=150)
    license_name: str | None = Field(default=None, max_length=200)
    issuing_authority: str | None = Field(default=None, max_length=200)
    issuing_country: str | None = Field(default=None, max_length=100)
    issue_date: date | None = None
    expiry_date: date | None = None
    renewal_due_date: date | None = None
    license_status: str | None = Field(default=None, max_length=30)
    document_reference: str | None = Field(default=None, max_length=255)
    is_mandatory: bool | None = None
    is_verified: bool | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityLicenseResponse(AuditEntityLicenseBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityLicenseListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityLicenseResponse]


class AuditEntityLicenseMessageResponse(BaseModel):
    message: str
    data: AuditEntityLicenseResponse | None = None
