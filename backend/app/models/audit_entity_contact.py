from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityContactType(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_contact_types"

    contact_type_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    contact_type_name: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )


class AuditEntityContact(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_contacts"

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    contact_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entity_contact_types.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    contact_name: Mapped[str] = mapped_column(
        String(150),
        index=True,
        nullable=False,
    )

    designation: Mapped[str | None] = mapped_column(
        String(150),
        index=True,
        nullable=True,
    )

    department: Mapped[str | None] = mapped_column(
        String(150),
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

    whatsapp: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_authorized_representative: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
