from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityAddressType(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_address_types"

    address_type_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    address_type_name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class AuditEntityAddress(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_addresses"

    __table_args__ = (
        UniqueConstraint(
            "audit_entity_id",
            "address_type_id",
            name="uq_audit_entity_address_entity_type",
        ),
    )

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    address_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entity_address_types.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
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
        String(20),
        nullable=True,
    )

    district_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    upazila_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    union_code: Mapped[str | None] = mapped_column(
        String(20),
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

    state_region: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        default="Bangladesh",
        nullable=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
