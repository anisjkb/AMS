from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityFinancialSnapshot(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_financial_snapshots"

    __table_args__ = (
        UniqueConstraint(
            "audit_entity_id",
            "fiscal_year",
            "statement_type",
            name="uq_audit_entity_financial_snapshot_entity_year_type",
        ),
    )

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    fiscal_year: Mapped[str] = mapped_column(
        String(20),
        index=True,
        nullable=False,
    )

    period_start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    period_end_date: Mapped[date | None] = mapped_column(
        Date,
        index=True,
        nullable=True,
    )

    statement_type: Mapped[str] = mapped_column(
        String(30),
        default="separate",
        index=True,
        nullable=False,
    )

    reporting_framework: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    currency_code: Mapped[str] = mapped_column(
        String(10),
        default="BDT",
        index=True,
        nullable=False,
    )

    financial_status: Mapped[str] = mapped_column(
        String(30),
        default="draft",
        index=True,
        nullable=False,
    )

    total_assets: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    total_liabilities: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    total_equity: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    current_assets: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    current_liabilities: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    revenue: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    cost_of_sales: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    gross_profit: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    operating_profit: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    profit_before_tax: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    profit_after_tax: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    cash_and_cash_equivalents: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    inventory: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    trade_receivables: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    trade_payables: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    loans_and_borrowings: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    ebitda: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    net_cash_flow: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    auditor_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    audit_report_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    source_document_reference: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_audited: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_consolidated: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
