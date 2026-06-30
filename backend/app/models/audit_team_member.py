from sqlalchemy import BigInteger, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class AuditTeamMember(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "audit_team_members"

    team_member_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    team_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_teams.team_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    member_type: Mapped[str] = mapped_column(
        String(20),
        default="Internal",
        index=True,
        nullable=False,
    )

    emp_id: Mapped[str | None] = mapped_column(
        String(20),
        index=True,
        nullable=True,
    )

    team_member_role: Mapped[str] = mapped_column(
        String(80),
        index=True,
        nullable=False,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    br_id: Mapped[str | None] = mapped_column(
        String(20),
        index=True,
        nullable=True,
    )

    client_id: Mapped[int | None] = mapped_column(
        BigInteger,
        index=True,
        nullable=True,
    )

    client_contact_id: Mapped[int | None] = mapped_column(
        Integer,
        index=True,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
