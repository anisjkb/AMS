from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class AuditEntityBase(BaseModel):
    parent_entity_id: int | None = None
    entity_name: str = Field(..., max_length=255)
    entity_type: str = Field(..., max_length=50)
    entity_class: str = Field(default="company", max_length=50)
    legal_status_id: int | None = None
    legal_status: str | None = Field(default=None, max_length=50)

    registration_no: str | None = Field(default=None, max_length=100)
    tax_identification_no: str | None = Field(default=None, max_length=100)
    contact_person: str | None = Field(default=None, max_length=150)
    contact_email: EmailStr | None = Field(default=None, max_length=150)
    contact_phone: str | None = Field(default=None, max_length=50)
    address: str | None = None
    city: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    risk_rating: str | None = Field(default=None, max_length=30)
    is_internal: bool = False
    is_confidential: bool = False
    description: str | None = None
    remarks: str | None = None


class AuditEntityCreate(AuditEntityBase):
    entity_code: str | None = Field(default=None, max_length=50)


class AuditEntityUpdate(BaseModel):
    parent_entity_id: int | None = None
    entity_code: str | None = Field(default=None, max_length=50)
    entity_name: str | None = Field(default=None, max_length=255)
    entity_type: str | None = Field(default=None, max_length=50)
    entity_class: str | None = Field(default=None, max_length=50)
    legal_status_id: int | None = None
    legal_status: str | None = Field(default=None, max_length=50)

    registration_no: str | None = Field(default=None, max_length=100)
    tax_identification_no: str | None = Field(default=None, max_length=100)
    contact_person: str | None = Field(default=None, max_length=150)
    contact_email: EmailStr | None = Field(default=None, max_length=150)
    contact_phone: str | None = Field(default=None, max_length=50)
    address: str | None = None
    city: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    risk_rating: str | None = Field(default=None, max_length=30)
    is_internal: bool | None = None
    is_confidential: bool | None = None
    description: str | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityResponse(AuditEntityBase):
    id: int
    entity_code: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityResponse]


class AuditEntityMessageResponse(BaseModel):
    message: str
    data: AuditEntityResponse | None = None
