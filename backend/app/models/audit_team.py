from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class AuditTeam(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "audit_teams"

    team_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    team_name: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    team_note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
