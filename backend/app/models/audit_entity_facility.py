from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityFacilityType(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_facility_types"

    facility_type_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    facility_type_name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class AuditEntityFacility(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_facilities"

    __table_args__ = (
        UniqueConstraint(
            "audit_entity_id",
            "facility_type_id",
            "facility_name",
            name="uq_audit_entity_facility_entity_type_name",
        ),
    )

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    facility_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entity_facility_types.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    facility_code: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    facility_name: Mapped[str] = mapped_column(
        String(200),
        index=True,
        nullable=False,
    )

    facility_status: Mapped[str] = mapped_column(
        String(30),
        default="operational",
        index=True,
        nullable=False,
    )

    ownership_type: Mapped[str | None] = mapped_column(
        String(30),
        index=True,
        nullable=True,
    )

    registration_no: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    contact_person: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(150),
        index=True,
        nullable=True,
    )

    contact_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    address_line1: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    address_line2: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    division_code: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    district_code: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    upazila_code: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    post_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        default="Bangladesh",
        nullable=True,
    )

    latitude: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 7),
        nullable=True,
    )

    longitude: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 7),
        nullable=True,
    )

    floor_area_sqft: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2),
        nullable=True,
    )

    production_capacity: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    number_of_employees: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    opening_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    closing_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_operational: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
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
