from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class ExitMeetingMinuteSnapshot(Base):
    __tablename__ = (
        "exit_meeting_minute_snapshots"
    )

    __table_args__ = (
        UniqueConstraint(
            "minute_id",
            "snapshot_version",
            name=(
                "uq_exit_snapshot_"
                "minute_version"
            ),
        ),
    )

    snapshot_id: Mapped[int] = mapped_column(
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

    snapshot_version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    snapshot_kind: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    snapshot_data: Mapped[
        dict[str, Any]
    ] = mapped_column(
        JSONB,
        nullable=False,
    )

    snapshot_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    template_key: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    template_version: Mapped[
        str | None
    ] = mapped_column(
        String(30),
        nullable=True,
    )

    source_unlock_request_id: Mapped[
        int | None
    ] = mapped_column(
        ForeignKey(
            "exit_meeting_minute_unlock_requests."
            "request_id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    locked_by_user_id: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    approved_by_user_id: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    locked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    lock_reason: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )

    is_current: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    created_by: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
