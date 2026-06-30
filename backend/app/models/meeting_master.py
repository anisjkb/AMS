from datetime import date

from sqlalchemy import BigInteger, Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class MeetingMaster(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "meeting_master"

    meeting_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    meeting_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    client_id: Mapped[int] = mapped_column(
        BigInteger,
        index=True,
        nullable=False,
    )

    client_code: Mapped[str] = mapped_column(
        String(10),
        index=True,
        nullable=False,
    )

    audit_year: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    meeting_date: Mapped[date] = mapped_column(
        Date,
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

    meeting_venue: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    meeting_note1: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
