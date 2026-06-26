from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class AuditEntityTaxAssessmentBase(BaseModel):
    audit_entity_id: int
    tax_year: str = Field(..., max_length=20)
    assessment_year: str | None = Field(default=None, max_length=20)
    tax_type: str = Field(default="income_tax", max_length=50)

    tax_identification_no: str | None = Field(default=None, max_length=100)
    tax_zone: str | None = Field(default=None, max_length=100)
    tax_circle: str | None = Field(default=None, max_length=100)
    tax_office: str | None = Field(default=None, max_length=200)

    return_submission_date: date | None = None
    assessment_date: date | None = None
    demand_notice_date: date | None = None
    payment_due_date: date | None = None

    declared_income: Decimal | None = Field(default=None, ge=0)
    assessed_income: Decimal | None = Field(default=None, ge=0)
    taxable_income: Decimal | None = Field(default=None, ge=0)

    tax_payable: Decimal | None = Field(default=None, ge=0)
    tax_paid: Decimal | None = Field(default=None, ge=0)
    outstanding_tax: Decimal | None = Field(default=None, ge=0)
    penalty_amount: Decimal | None = Field(default=None, ge=0)
    interest_amount: Decimal | None = Field(default=None, ge=0)

    assessment_status: str = Field(default="draft", max_length=50)
    appeal_status: str | None = Field(default=None, max_length=50)
    document_reference: str | None = Field(default=None, max_length=255)

    description: str | None = None
    remarks: str | None = None


class AuditEntityTaxAssessmentCreate(AuditEntityTaxAssessmentBase):
    pass


class AuditEntityTaxAssessmentUpdate(BaseModel):
    audit_entity_id: int | None = None
    tax_year: str | None = Field(default=None, max_length=20)
    assessment_year: str | None = Field(default=None, max_length=20)
    tax_type: str | None = Field(default=None, max_length=50)

    tax_identification_no: str | None = Field(default=None, max_length=100)
    tax_zone: str | None = Field(default=None, max_length=100)
    tax_circle: str | None = Field(default=None, max_length=100)
    tax_office: str | None = Field(default=None, max_length=200)

    return_submission_date: date | None = None
    assessment_date: date | None = None
    demand_notice_date: date | None = None
    payment_due_date: date | None = None

    declared_income: Decimal | None = Field(default=None, ge=0)
    assessed_income: Decimal | None = Field(default=None, ge=0)
    taxable_income: Decimal | None = Field(default=None, ge=0)

    tax_payable: Decimal | None = Field(default=None, ge=0)
    tax_paid: Decimal | None = Field(default=None, ge=0)
    outstanding_tax: Decimal | None = Field(default=None, ge=0)
    penalty_amount: Decimal | None = Field(default=None, ge=0)
    interest_amount: Decimal | None = Field(default=None, ge=0)

    assessment_status: str | None = Field(default=None, max_length=50)
    appeal_status: str | None = Field(default=None, max_length=50)
    document_reference: str | None = Field(default=None, max_length=255)

    description: str | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityTaxAssessmentResponse(AuditEntityTaxAssessmentBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityTaxAssessmentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityTaxAssessmentResponse]


class AuditEntityTaxAssessmentMessageResponse(BaseModel):
    message: str
    data: AuditEntityTaxAssessmentResponse | None = None
