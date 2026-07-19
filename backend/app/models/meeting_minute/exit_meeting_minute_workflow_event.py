from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class ExitMeetingMinuteWorkflowEvent(Base):
    __tablename__ = (
        "exit_meeting_minute_workflow_events"
    )

    event_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    minute_id: Mapped[int] = mapped_column(
        ForeignKey(
            "exit_meeting_minutes.minute_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    unlock_request_id: Mapped[
        int | None
    ] = mapped_column(
        ForeignKey(
            "exit_meeting_minute_unlock_requests."
            "request_id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    snapshot_id: Mapped[
        int | None
    ] = mapped_column(
        ForeignKey(
            "exit_meeting_minute_snapshots."
            "snapshot_id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    from_status: Mapped[
        str | None
    ] = mapped_column(
        String(40),
        nullable=True,
    )

    to_status: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    event_comment: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )

    event_payload: Mapped[
        dict[str, Any] | None
    ] = mapped_column(
        JSONB,
        nullable=True,
    )

    performed_by_user_id: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    performed_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
