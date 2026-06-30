from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class MeetingParticipant(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "meeting_participants"

    participant_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    report_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meeting_reports.report_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        index=True,
        nullable=False,
    )

    designation: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    signature: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
