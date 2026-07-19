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
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class ExitMeetingMinuteUnlockRequest(Base):
    __tablename__ = (
        "exit_meeting_minute_unlock_requests"
    )

    request_id: Mapped[int] = mapped_column(
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

    request_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
        server_default="pending",
        index=True,
    )

    request_reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    edit_scope: Mapped[
        list[str] | dict[str, Any]
    ] = mapped_column(
        JSONB,
        nullable=False,
    )

    requested_by_user_id: Mapped[
        str
    ] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    requested_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
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

    review_comment: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )

    approved_until: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    cancelled_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    created_by: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )

    updated_by: Mapped[
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

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
