from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class MeetingParticipant(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "meeting_participants"

    participant_id: Mapped[int] = mapped_column(
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

    source_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    audit_team_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_teams.team_id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    audit_team_member_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_team_members.team_member_id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    entity_contact_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("audit_entity_contacts.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )
