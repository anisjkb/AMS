# E:\Audit\AMS\backend\app\models\designation.py

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class Designation(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "designations"

    designation_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    designation_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    designation_short_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

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

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )