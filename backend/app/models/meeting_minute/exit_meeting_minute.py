from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class ExitMeetingMinute(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "exit_meeting_minutes"

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


    workflow_status: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="draft",
        server_default="draft",
        index=True,
    )

    workflow_version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
    )

    unlock_cycle_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    submitted_by_user_id: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    submitted_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    reviewed_by_user_id: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    reviewed_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    review_note: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )

    current_edit_scope: Mapped[
        list[str] | None
    ] = mapped_column(
        JSONB,
        nullable=True,
    )

    edit_approved_until: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_workflow_by_user_id: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    last_workflow_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    current_snapshot_id: Mapped[
        int | None
    ] = mapped_column(
        ForeignKey(
            "exit_meeting_minute_snapshots."
            "snapshot_id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    current_unlock_request_id: Mapped[
        int | None
    ] = mapped_column(
        ForeignKey(
            "exit_meeting_minute_unlock_requests."
            "request_id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
