from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class AuditEntityContactTypeBase(BaseModel):
    contact_type_code: str = Field(..., max_length=20)
    contact_type_name: str = Field(..., max_length=150)
    description: str | None = None


class AuditEntityContactTypeResponse(AuditEntityContactTypeBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityContactTypeListResponse(BaseModel):
    total: int
    items: list[AuditEntityContactTypeResponse]


class AuditEntityContactBase(BaseModel):
    audit_entity_id: int
    contact_type_id: int
    contact_name: str = Field(..., max_length=150)
    designation: str | None = Field(default=None, max_length=150)
    department: str | None = Field(default=None, max_length=150)
    email: EmailStr | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=50)
    mobile: str | None = Field(default=None, max_length=50)
    whatsapp: str | None = Field(default=None, max_length=50)
    is_primary: bool = False
    is_authorized_representative: bool = False
    remarks: str | None = None


class AuditEntityContactCreate(AuditEntityContactBase):
    pass


class AuditEntityContactUpdate(BaseModel):
    audit_entity_id: int | None = None
    contact_type_id: int | None = None
    contact_name: str | None = Field(default=None, max_length=150)
    designation: str | None = Field(default=None, max_length=150)
    department: str | None = Field(default=None, max_length=150)
    email: EmailStr | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=50)
    mobile: str | None = Field(default=None, max_length=50)
    whatsapp: str | None = Field(default=None, max_length=50)
    is_primary: bool | None = None
    is_authorized_representative: bool | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityContactResponse(AuditEntityContactBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityContactListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityContactResponse]


class AuditEntityContactMessageResponse(BaseModel):
    message: str
    data: AuditEntityContactResponse | None = None
