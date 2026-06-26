from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityTaxAssessment(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_tax_assessments"

    __table_args__ = (
        UniqueConstraint(
            "audit_entity_id",
            "tax_year",
            "tax_type",
            name="uq_audit_entity_tax_assessment_entity_year_type",
        ),
    )

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    tax_year: Mapped[str] = mapped_column(
        String(20),
        index=True,
        nullable=False,
    )

    assessment_year: Mapped[str | None] = mapped_column(
        String(20),
        index=True,
        nullable=True,
    )

    tax_type: Mapped[str] = mapped_column(
        String(50),
        default="income_tax",
        index=True,
        nullable=False,
    )

    tax_identification_no: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    tax_zone: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    tax_circle: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    tax_office: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    return_submission_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    assessment_date: Mapped[date | None] = mapped_column(
        Date,
        index=True,
        nullable=True,
    )

    demand_notice_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    payment_due_date: Mapped[date | None] = mapped_column(
        Date,
        index=True,
        nullable=True,
    )

    declared_income: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    assessed_income: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    taxable_income: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    tax_payable: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    tax_paid: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    outstanding_tax: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    penalty_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    interest_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    assessment_status: Mapped[str] = mapped_column(
        String(50),
        default="draft",
        index=True,
        nullable=False,
    )

    appeal_status: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    document_reference: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
