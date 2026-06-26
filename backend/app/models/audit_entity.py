from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntity(IntegerPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "audit_entities"

    parent_entity_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    entity_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    entity_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    entity_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    entity_class: Mapped[str] = mapped_column(
        String(50),
        index=True,
        default="company",
        nullable=False,
    )

    legal_status_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("legal_statuses.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    legal_status: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    registration_no: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    tax_identification_no: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    contact_person: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    contact_email: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    contact_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    risk_rating: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    is_internal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_confidential: Mapped[bool] = mapped_column(
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
