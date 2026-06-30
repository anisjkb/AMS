from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class MeetingReport(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "meeting_reports"

    report_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    meeting_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("meeting_master.meeting_id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    meeting_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    client_name: Mapped[str] = mapped_column(
        String(150),
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

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
