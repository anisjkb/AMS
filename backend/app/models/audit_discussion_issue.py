from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class AuditDiscussionIssue(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "audit_discussion_issues"

    issue_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    audit_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    discussion_point: Mapped[str] = mapped_column(
        String(100),
        index=True,
        nullable=False,
    )

    default_decision: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
