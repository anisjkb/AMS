"""add meeting id to meeting reports

Revision ID: c244a1b2c3d4
Revises: c24d1a2b3c4d
Create Date: 2026-06-30

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c244a1b2c3d4"
down_revision: Union[str, None] = "c24d1a2b3c4d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "meeting_reports",
        sa.Column("meeting_id", sa.Integer(), nullable=True),
    )
    op.create_index(
        "ix_meeting_reports_meeting_id",
        "meeting_reports",
        ["meeting_id"],
    )
    op.create_foreign_key(
        "fk_meeting_reports_meeting_id_meeting_master",
        "meeting_reports",
        "meeting_master",
        ["meeting_id"],
        ["meeting_id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_meeting_reports_meeting_id_meeting_master",
        "meeting_reports",
        type_="foreignkey",
    )
    op.drop_index(
        "ix_meeting_reports_meeting_id",
        table_name="meeting_reports",
    )
    op.drop_column("meeting_reports", "meeting_id")
