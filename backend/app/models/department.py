# backend/app/models/department.py

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class Department(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "departments"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
        index=True,
    )

    department_code: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    department_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    department_short_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    department_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    department_phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        index=True,
    )

    department_address: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )