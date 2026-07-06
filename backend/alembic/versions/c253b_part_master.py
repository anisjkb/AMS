"""link meeting participants to meeting master

Revision ID: c253b_part_master
Revises: c253a_mt_nav_seed
Create Date: 2026-07-06
"""

from alembic import op
import sqlalchemy as sa


revision = "c253b_part_master"
down_revision = "c253a_mt_nav_seed"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("meeting_participants") as batch_op:
        batch_op.add_column(sa.Column("meeting_id", sa.Integer(), nullable=True))

    op.execute("""
        update meeting_participants mp
        set meeting_id = mr.meeting_id
        from meeting_reports mr
        where mp.report_id = mr.report_id
          and mp.meeting_id is null
    """)

    with op.batch_alter_table("meeting_participants") as batch_op:
        batch_op.alter_column(
            "report_id",
            existing_type=sa.Integer(),
            nullable=True,
        )
        batch_op.create_index(
            "ix_meeting_participants_meeting_id",
            ["meeting_id"],
            unique=False,
        )
        batch_op.create_foreign_key(
            "fk_meeting_participants_meeting_id_meeting_master",
            "meeting_master",
            ["meeting_id"],
            ["meeting_id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("meeting_participants") as batch_op:
        batch_op.drop_constraint(
            "fk_meeting_participants_meeting_id_meeting_master",
            type_="foreignkey",
        )
        batch_op.drop_index("ix_meeting_participants_meeting_id")
        batch_op.drop_column("meeting_id")
        batch_op.alter_column(
            "report_id",
            existing_type=sa.Integer(),
            nullable=False,
        )
