from datetime import date

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class AuditEntityExchangeListing(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_entity_exchange_listings"

    __table_args__ = (
        UniqueConstraint(
            "audit_entity_id",
            "stock_exchange",
            name="uq_audit_entity_exchange_listing_entity_exchange",
        ),
    )

    audit_entity_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_entities.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    listing_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    stock_exchange: Mapped[str] = mapped_column(
        String(30),
        index=True,
        nullable=False,
        default="none",
    )

    trading_code: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    scrip_code: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    isin_code: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    market_category: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )

    listed_sector: Mapped[str | None] = mapped_column(
        String(150),
        index=True,
        nullable=True,
    )

    listing_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    listing_status: Mapped[str] = mapped_column(
        String(30),
        index=True,
        default="unlisted",
        nullable=False,
    )

    is_primary_listing: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
