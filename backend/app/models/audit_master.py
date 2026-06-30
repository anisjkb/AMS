from datetime import date

from sqlalchemy import BigInteger, Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class AuditMaster(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "audit_master"

    audit_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    client_id: Mapped[int] = mapped_column(
        BigInteger,
        index=True,
        nullable=False,
    )

    audit_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    audit_year: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    audit_start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    audit_end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    audit_note: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )

    audit_name: Mapped[str | None] = mapped_column(
        String(50),
        index=True,
        nullable=True,
    )
