"""create audit core foundation

Revision ID: c246a1b2c3d4
Revises: c244a1b2c3d4
Create Date: 2026-06-30

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c246a1b2c3d4"
down_revision: Union[str, None] = "c244a1b2c3d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def audit_columns() -> list[sa.Column]:
    return [
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    ]


def upgrade() -> None:
    op.create_table(
        "audit_master",
        sa.Column("audit_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("client_id", sa.BigInteger(), nullable=False),
        sa.Column("audit_type", sa.String(length=50), nullable=False),
        sa.Column("audit_year", sa.String(length=50), nullable=False),
        sa.Column("audit_start_date", sa.Date(), nullable=False),
        sa.Column("audit_end_date", sa.Date(), nullable=False),
        sa.Column("audit_note", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        sa.Column("audit_name", sa.String(length=50), nullable=True),
        *audit_columns(),
        sa.PrimaryKeyConstraint("audit_id"),
    )
    op.create_index("ix_audit_master_audit_id", "audit_master", ["audit_id"])
    op.create_index("idx_audit_master_client_id", "audit_master", ["client_id"])
    op.create_index("idx_audit_master_audit_type", "audit_master", ["audit_type"])
    op.create_index("idx_audit_master_audit_year", "audit_master", ["audit_year"])
    op.create_index("idx_audit_master_audit_name", "audit_master", ["audit_name"])
    op.create_index("idx_audit_master_status", "audit_master", ["status"])

    op.create_table(
        "audit_teams",
        sa.Column("team_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("team_name", sa.String(length=50), nullable=False),
        sa.Column("team_note", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        *audit_columns(),
        sa.PrimaryKeyConstraint("team_id"),
    )
    op.create_index("ix_audit_teams_team_id", "audit_teams", ["team_id"])
    op.create_index("idx_audit_teams_team_name", "audit_teams", ["team_name"])
    op.create_index("idx_audit_teams_status", "audit_teams", ["status"])

    op.create_table(
        "audit_discussion_issues",
        sa.Column("issue_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("audit_type", sa.String(length=50), nullable=False),
        sa.Column("discussion_point", sa.String(length=100), nullable=False),
        sa.Column("default_decision", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        *audit_columns(),
        sa.PrimaryKeyConstraint("issue_id"),
    )
    op.create_index(
        "ix_audit_discussion_issues_issue_id",
        "audit_discussion_issues",
        ["issue_id"],
    )
    op.create_index(
        "idx_audit_discussion_issues_audit_type",
        "audit_discussion_issues",
        ["audit_type"],
    )
    op.create_index(
        "idx_audit_discussion_issues_discussion_point",
        "audit_discussion_issues",
        ["discussion_point"],
    )
    op.create_index(
        "idx_audit_discussion_issues_status",
        "audit_discussion_issues",
        ["status"],
    )

    op.create_table(
        "audit_team_members",
        sa.Column("team_member_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("team_id", sa.Integer(), nullable=False),
        sa.Column(
            "member_type",
            sa.String(length=20),
            server_default="Internal",
            nullable=False,
        ),
        sa.Column("emp_id", sa.String(length=20), nullable=True),
        sa.Column("team_member_role", sa.String(length=80), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("br_id", sa.String(length=20), nullable=True),
        sa.Column("client_id", sa.BigInteger(), nullable=True),
        sa.Column("client_contact_id", sa.Integer(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["audit_teams.team_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("team_member_id"),
    )
    op.create_index(
        "ix_audit_team_members_team_member_id",
        "audit_team_members",
        ["team_member_id"],
    )
    op.create_index("idx_audit_team_members_team_id", "audit_team_members", ["team_id"])
    op.create_index(
        "idx_audit_team_members_member_type",
        "audit_team_members",
        ["member_type"],
    )
    op.create_index("idx_audit_team_members_emp_id", "audit_team_members", ["emp_id"])
    op.create_index("idx_audit_team_members_br_id", "audit_team_members", ["br_id"])
    op.create_index(
        "idx_audit_team_members_client_id",
        "audit_team_members",
        ["client_id"],
    )
    op.create_index(
        "idx_audit_team_members_client_contact_id",
        "audit_team_members",
        ["client_contact_id"],
    )
    op.create_index(
        "idx_audit_team_members_status",
        "audit_team_members",
        ["status"],
    )

    op.create_table(
        "audit_visit_info",
        sa.Column("visit_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("audit_id", sa.Integer(), nullable=False),
        sa.Column("team_id", sa.Integer(), nullable=False),
        sa.Column("client_address_id", sa.Integer(), nullable=False),
        sa.Column("visit_date", sa.Date(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["audit_id"],
            ["audit_master.audit_id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["audit_teams.team_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("visit_id"),
    )
    op.create_index("ix_audit_visit_info_visit_id", "audit_visit_info", ["visit_id"])
    op.create_index("idx_audit_visit_info_audit_id", "audit_visit_info", ["audit_id"])
    op.create_index("idx_audit_visit_info_team_id", "audit_visit_info", ["team_id"])
    op.create_index(
        "idx_audit_visit_info_client_address_id",
        "audit_visit_info",
        ["client_address_id"],
    )
    op.create_index(
        "idx_audit_visit_info_visit_date",
        "audit_visit_info",
        ["visit_date"],
    )
    op.create_index("idx_audit_visit_info_status", "audit_visit_info", ["status"])

    op.create_table(
        "audit_visit_observations",
        sa.Column(
            "visit_observation_id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("issue_id", sa.Integer(), nullable=True),
        sa.Column("audit_type", sa.String(length=50), nullable=False),
        sa.Column("discussion_point", sa.String(length=100), nullable=False),
        sa.Column("observation_discussion", sa.Text(), nullable=False),
        sa.Column("observation_decision", sa.Text(), nullable=False),
        sa.Column("visit_id", sa.Integer(), nullable=True),
        sa.Column("audit_id", sa.Integer(), nullable=True),
        sa.Column("team_id", sa.Integer(), nullable=True),
        sa.Column("observation_note", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["issue_id"],
            ["audit_discussion_issues.issue_id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["visit_id"],
            ["audit_visit_info.visit_id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["audit_id"],
            ["audit_master.audit_id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["audit_teams.team_id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("visit_observation_id"),
    )
    op.create_index(
        "ix_audit_visit_observations_visit_observation_id",
        "audit_visit_observations",
        ["visit_observation_id"],
    )
    op.create_index(
        "idx_audit_visit_observations_issue_id",
        "audit_visit_observations",
        ["issue_id"],
    )
    op.create_index(
        "idx_audit_visit_observations_audit_type",
        "audit_visit_observations",
        ["audit_type"],
    )
    op.create_index(
        "idx_audit_visit_observations_visit_id",
        "audit_visit_observations",
        ["visit_id"],
    )
    op.create_index(
        "idx_audit_visit_observations_audit_id",
        "audit_visit_observations",
        ["audit_id"],
    )
    op.create_index(
        "idx_audit_visit_observations_team_id",
        "audit_visit_observations",
        ["team_id"],
    )
    op.create_index(
        "idx_audit_visit_observations_status",
        "audit_visit_observations",
        ["status"],
    )


def downgrade() -> None:
    op.drop_table("audit_visit_observations")
    op.drop_table("audit_visit_info")
    op.drop_table("audit_team_members")
    op.drop_table("audit_discussion_issues")
    op.drop_table("audit_teams")
    op.drop_table("audit_master")
