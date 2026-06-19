# E:\Audit\AMS\backend\app\models\employee.py

from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class Employee(IntegerPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "employees"

    employee_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    official_employee_id: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
    )

    employee_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    photo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    photo_thumb_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    passport_photo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    photo_original_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    photo_mime_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    photo_size_bytes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    signature_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
    )

    nid: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
    )

    dob: Mapped[date | None] = mapped_column(Date, nullable=True)
    joining_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)

    employee_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Permanent",
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

    designation_id: Mapped[int] = mapped_column(
        ForeignKey("designations.id"),
        nullable=False,
        index=True,
    )

    reporting_to_employee_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id"),
        nullable=True,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
