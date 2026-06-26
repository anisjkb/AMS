from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class AuditEntityFinancialSnapshotBase(BaseModel):
    audit_entity_id: int
    fiscal_year: str = Field(..., max_length=20)
    period_start_date: date | None = None
    period_end_date: date | None = None
    statement_type: str = Field(default="separate", max_length=30)
    reporting_framework: str | None = Field(default=None, max_length=100)
    currency_code: str = Field(default="BDT", max_length=10)
    financial_status: str = Field(default="draft", max_length=30)

    total_assets: Decimal | None = Field(default=None, ge=0)
    total_liabilities: Decimal | None = Field(default=None, ge=0)
    total_equity: Decimal | None = None
    current_assets: Decimal | None = Field(default=None, ge=0)
    current_liabilities: Decimal | None = Field(default=None, ge=0)

    revenue: Decimal | None = None
    cost_of_sales: Decimal | None = None
    gross_profit: Decimal | None = None
    operating_profit: Decimal | None = None
    profit_before_tax: Decimal | None = None
    profit_after_tax: Decimal | None = None

    cash_and_cash_equivalents: Decimal | None = Field(default=None, ge=0)
    inventory: Decimal | None = Field(default=None, ge=0)
    trade_receivables: Decimal | None = Field(default=None, ge=0)
    trade_payables: Decimal | None = Field(default=None, ge=0)
    loans_and_borrowings: Decimal | None = Field(default=None, ge=0)
    ebitda: Decimal | None = None
    net_cash_flow: Decimal | None = None

    auditor_name: str | None = Field(default=None, max_length=200)
    audit_report_date: date | None = None
    source_document_reference: str | None = Field(default=None, max_length=255)

    is_audited: bool = False
    is_consolidated: bool = False
    description: str | None = None
    remarks: str | None = None


class AuditEntityFinancialSnapshotCreate(AuditEntityFinancialSnapshotBase):
    pass


class AuditEntityFinancialSnapshotUpdate(BaseModel):
    audit_entity_id: int | None = None
    fiscal_year: str | None = Field(default=None, max_length=20)
    period_start_date: date | None = None
    period_end_date: date | None = None
    statement_type: str | None = Field(default=None, max_length=30)
    reporting_framework: str | None = Field(default=None, max_length=100)
    currency_code: str | None = Field(default=None, max_length=10)
    financial_status: str | None = Field(default=None, max_length=30)

    total_assets: Decimal | None = Field(default=None, ge=0)
    total_liabilities: Decimal | None = Field(default=None, ge=0)
    total_equity: Decimal | None = None
    current_assets: Decimal | None = Field(default=None, ge=0)
    current_liabilities: Decimal | None = Field(default=None, ge=0)

    revenue: Decimal | None = None
    cost_of_sales: Decimal | None = None
    gross_profit: Decimal | None = None
    operating_profit: Decimal | None = None
    profit_before_tax: Decimal | None = None
    profit_after_tax: Decimal | None = None

    cash_and_cash_equivalents: Decimal | None = Field(default=None, ge=0)
    inventory: Decimal | None = Field(default=None, ge=0)
    trade_receivables: Decimal | None = Field(default=None, ge=0)
    trade_payables: Decimal | None = Field(default=None, ge=0)
    loans_and_borrowings: Decimal | None = Field(default=None, ge=0)
    ebitda: Decimal | None = None
    net_cash_flow: Decimal | None = None

    auditor_name: str | None = Field(default=None, max_length=200)
    audit_report_date: date | None = None
    source_document_reference: str | None = Field(default=None, max_length=255)

    is_audited: bool | None = None
    is_consolidated: bool | None = None
    description: str | None = None
    remarks: str | None = None
    is_active: bool | None = None


class AuditEntityFinancialSnapshotResponse(AuditEntityFinancialSnapshotBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditEntityFinancialSnapshotListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditEntityFinancialSnapshotResponse]


class AuditEntityFinancialSnapshotMessageResponse(BaseModel):
    message: str
    data: AuditEntityFinancialSnapshotResponse | None = None
