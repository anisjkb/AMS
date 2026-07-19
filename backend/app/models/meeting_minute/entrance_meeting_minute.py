from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
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

    is_locked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    locked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    locked_by_user_id: Mapped[str | None] = mapped_column(
        String(100),
        index=True,
        nullable=True,
    )

    template_key: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    template_version: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    snapshot_version: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    snapshot_data: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    snapshot_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
