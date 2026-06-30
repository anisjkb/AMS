from datetime import date

from sqlalchemy import ForeignKey, Integer, String, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class AuditVisitInfo(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "audit_visit_info"

    visit_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    audit_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_master.audit_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    team_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("audit_teams.team_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    client_address_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
        nullable=False,
    )

    visit_date: Mapped[date] = mapped_column(
        Date,
        index=True,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
