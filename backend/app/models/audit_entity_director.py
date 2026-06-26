from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityDirectorType(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_director_types"

    director_type_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    director_type_name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class AuditEntityDirector(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_directors"

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    director_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entity_director_types.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    person_name: Mapped[str] = mapped_column(
        String(150),
        index=True,
        nullable=False,
    )

    designation: Mapped[str | None] = mapped_column(
        String(150),
        index=True,
        nullable=True,
    )

    father_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    mother_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    spouse_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    nationality: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    nid_no: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    passport_no: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    tax_identification_no: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(150),
        index=True,
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    mobile: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    ownership_percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    appointment_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    resignation_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_signatory: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_beneficial_owner: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
