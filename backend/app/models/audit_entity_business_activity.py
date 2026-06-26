from sqlalchemy import (
    Boolean,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityBusinessActivity(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_business_activities"

    __table_args__ = (
        UniqueConstraint(
            "audit_entity_id",
            "business_industry_id",
            name="uq_audit_entity_business_activity_industry",
        ),
    )

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    activity_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    activity_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    business_nature_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("business_natures.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    business_sector_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("business_sectors.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    business_industry_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("business_industries.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    risk_rating: Mapped[str | None] = mapped_column(
        String(30),
        index=True,
        nullable=True,
    )

    revenue_percentage: Mapped[float | None] = mapped_column(
        Float,
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
