from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class EntranceMeetingMinute(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "entrance_meeting_minutes"

    minute_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    meeting_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meeting_master.meeting_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    chairman_participant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meeting_participants.participant_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
