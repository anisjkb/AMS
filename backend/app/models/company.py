# backend/app/models/company.py

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class Company(IntegerPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "companies"

    company_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    company_short_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    company_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    company_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    company_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    tax_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    trade_license: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )