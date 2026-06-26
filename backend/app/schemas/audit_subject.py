from datetime import datetime

from pydantic import BaseModel, Field

from app.common.enums import AuditSubjectType, RiskLevel


class AuditSubjectBase(BaseModel):
    subject_name: str = Field(..., max_length=255)
    subject_type: AuditSubjectType
    reference_code: str | None = Field(default=None, max_length=100)
    owner_department: str | None = Field(default=None, max_length=150)
    location: str | None = Field(default=None, max_length=255)
    risk_level: RiskLevel | None = None
    is_confidential: bool = False
    description: str | None = None
    remarks: str | None = None


class AuditSubjectCreate(AuditSubjectBase):
    subject_code: str | None = Field(default=None, max_length=50)


class AuditSubjectUpdate(BaseModel):
    subject_name: str | None = Field(default=None, max_length=255)
    subject_type: AuditSubjectType | None = None
    reference_code: str | None = Field(default=None, max_length=100)
    owner_department: str | None = Field(default=None, max_length=150)
    location: str | None = Field(default=None, max_length=255)
    risk_level: RiskLevel | None = None
    is_confidential: bool | None = None
    description: str | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditSubjectResponse(AuditSubjectBase):
    id: int
    subject_code: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditSubjectListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditSubjectResponse]


class AuditSubjectMessageResponse(BaseModel):
    message: str
    data: AuditSubjectResponse | None = None
