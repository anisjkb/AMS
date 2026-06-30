from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class GeneralDiscussion(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "general_discussions"

    discussion_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    report_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meeting_reports.report_id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    discussion_point: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    decision: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
