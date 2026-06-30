from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class AuditVisitObservation(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "audit_visit_observations"

    visit_observation_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    issue_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_discussion_issues.issue_id", ondelete="SET NULL"),
        index=True,
        nullable=True,
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

    observation_discussion: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    observation_decision: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    visit_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_visit_info.visit_id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    audit_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_master.audit_id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    team_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_teams.team_id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    observation_note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
