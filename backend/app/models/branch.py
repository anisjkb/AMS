#backend/app/models/branch.py

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import (
    ActiveStatusMixin,
    AuditMixin,
    Base,
    IntegerPrimaryKeyMixin,
)


class Branch(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "branches"

    branch_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    branch_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    branch_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    branch_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    branch_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )