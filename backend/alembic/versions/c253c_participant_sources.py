"""finalize meeting participant source references

Revision ID: c253c_part_sources
Revises: c253b_part_master
Create Date: 2026-07-06
"""

from alembic import op
import sqlalchemy as sa


revision = "c253c_part_sources"
down_revision = "c253b_part_master"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Old manual participant rows cannot be preserved because final design stores
    # source references only, not copied name/designation/signature values.
    op.execute("delete from meeting_participants")

    with op.batch_alter_table("meeting_participants") as batch_op:
        batch_op.drop_constraint("meeting_participants_report_id_fkey", type_="foreignkey")
        batch_op.drop_column("report_id")
        batch_op.drop_column("name")
        batch_op.drop_column("designation")
        batch_op.drop_column("signature")

        batch_op.add_column(sa.Column("source_type", sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column("audit_team_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("audit_team_member_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("entity_contact_id", sa.Integer(), nullable=True))

        batch_op.alter_column(
            "meeting_id",
            existing_type=sa.Integer(),
            nullable=False,
        )

        batch_op.create_index("ix_meeting_participants_source_type", ["source_type"])
        batch_op.create_index("ix_meeting_participants_audit_team_id", ["audit_team_id"])
        batch_op.create_index("ix_meeting_participants_audit_team_member_id", ["audit_team_member_id"])
        batch_op.create_index("ix_meeting_participants_entity_contact_id", ["entity_contact_id"])

        batch_op.create_foreign_key(
            "fk_meeting_participants_audit_team_id_audit_teams",
            "audit_teams",
            ["audit_team_id"],
            ["team_id"],
        )
        batch_op.create_foreign_key(
            "fk_meeting_participants_audit_team_member_id_audit_team_members",
            "audit_team_members",
            ["audit_team_member_id"],
            ["team_member_id"],
        )
        batch_op.create_foreign_key(
            "fk_meeting_participants_entity_contact_id_audit_entity_contacts",
            "audit_entity_contacts",
            ["entity_contact_id"],
            ["id"],
        )
        batch_op.create_check_constraint(
            "ck_meeting_participants_source_type",
            "source_type in ('internal_audit_team', 'client_entity_team')",
        )


def downgrade() -> None:
    with op.batch_alter_table("meeting_participants") as batch_op:
        batch_op.drop_constraint("ck_meeting_participants_source_type", type_="check")
        batch_op.drop_constraint("fk_meeting_participants_entity_contact_id_audit_entity_contacts", type_="foreignkey")
        batch_op.drop_constraint("fk_meeting_participants_audit_team_member_id_audit_team_members", type_="foreignkey")
        batch_op.drop_constraint("fk_meeting_participants_audit_team_id_audit_teams", type_="foreignkey")

        batch_op.drop_index("ix_meeting_participants_entity_contact_id")
        batch_op.drop_index("ix_meeting_participants_audit_team_member_id")
        batch_op.drop_index("ix_meeting_participants_audit_team_id")
        batch_op.drop_index("ix_meeting_participants_source_type")

        batch_op.add_column(sa.Column("signature", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("designation", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("name", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("report_id", sa.Integer(), nullable=True))

        batch_op.drop_column("entity_contact_id")
        batch_op.drop_column("audit_team_member_id")
        batch_op.drop_column("audit_team_id")
        batch_op.drop_column("source_type")

        batch_op.alter_column(
            "meeting_id",
            existing_type=sa.Integer(),
            nullable=True,
        )

        batch_op.create_foreign_key(
            "meeting_participants_report_id_fkey",
            "meeting_reports",
            ["report_id"],
            ["report_id"],
        )
