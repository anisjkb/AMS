from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityLicenseType(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_license_types"

    license_type_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    license_type_name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class AuditEntityLicense(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_licenses"

    __table_args__ = (
        UniqueConstraint(
            "audit_entity_id",
            "license_type_id",
            "license_no",
            name="uq_audit_entity_license_entity_type_no",
        ),
    )

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    license_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entity_license_types.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    license_no: Mapped[str] = mapped_column(
        String(150),
        index=True,
        nullable=False,
    )

    license_name: Mapped[str | None] = mapped_column(
        String(200),
        index=True,
        nullable=True,
    )

    issuing_authority: Mapped[str | None] = mapped_column(
        String(200),
        index=True,
        nullable=True,
    )

    issuing_country: Mapped[str | None] = mapped_column(
        String(100),
        default="Bangladesh",
        nullable=True,
    )

    issue_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    expiry_date: Mapped[date | None] = mapped_column(
        Date,
        index=True,
        nullable=True,
    )

    renewal_due_date: Mapped[date | None] = mapped_column(
        Date,
        index=True,
        nullable=True,
    )

    license_status: Mapped[str] = mapped_column(
        String(30),
        default="valid",
        index=True,
        nullable=False,
    )

    document_reference: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_mandatory: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
