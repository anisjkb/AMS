"""create audit meeting tables

Revision ID: c24d1a2b3c4d
Revises: a9f1b99d86b7
Create Date: 2026-06-30 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c24d1a2b3c4d"
down_revision: Union[str, None] = "a9f1b99d86b7"
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
        "meeting_master",
        sa.Column("meeting_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("meeting_type", sa.String(length=50), nullable=False),
        sa.Column("client_id", sa.BigInteger(), nullable=False),
        sa.Column("client_code", sa.String(length=10), nullable=False),
        sa.Column("audit_year", sa.String(length=50), nullable=False),
        sa.Column("meeting_date", sa.Date(), nullable=False),
        sa.Column("audit_start_date", sa.Date(), nullable=False),
        sa.Column("audit_end_date", sa.Date(), nullable=False),
        sa.Column("meeting_venue", sa.String(length=255), nullable=False),
        sa.Column("meeting_note1", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="active",
            nullable=False,
        ),
        *audit_columns(),
        sa.PrimaryKeyConstraint("meeting_id"),
    )
    op.create_index("ix_meeting_master_meeting_id", "meeting_master", ["meeting_id"])
    op.create_index("ix_meeting_master_meeting_type", "meeting_master", ["meeting_type"])
    op.create_index("ix_meeting_master_client_id", "meeting_master", ["client_id"])
    op.create_index("ix_meeting_master_client_code", "meeting_master", ["client_code"])
    op.create_index("ix_meeting_master_audit_year", "meeting_master", ["audit_year"])
    op.create_index("ix_meeting_master_meeting_date", "meeting_master", ["meeting_date"])
    op.create_index("ix_meeting_master_status", "meeting_master", ["status"])
    op.create_index(
        "idx_meeting_master_type_client_code_date",
        "meeting_master",
        ["meeting_type", "client_id", "client_code", "meeting_date"],
    )

    op.create_table(
        "meeting_reports",
        sa.Column("report_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("meeting_type", sa.String(length=50), nullable=False),
        sa.Column("client_name", sa.String(length=150), nullable=False),
        sa.Column("audit_year", sa.String(length=50), nullable=False),
        sa.Column("meeting_date", sa.Date(), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        *audit_columns(),
        sa.PrimaryKeyConstraint("report_id"),
    )
    op.create_index("ix_meeting_reports_report_id", "meeting_reports", ["report_id"])
    op.create_index("ix_meeting_reports_meeting_type", "meeting_reports", ["meeting_type"])
    op.create_index("ix_meeting_reports_client_name", "meeting_reports", ["client_name"])
    op.create_index("ix_meeting_reports_audit_year", "meeting_reports", ["audit_year"])
    op.create_index("ix_meeting_reports_meeting_date", "meeting_reports", ["meeting_date"])
    op.create_index(
        "idx_meeting_reports_type_client_date",
        "meeting_reports",
        ["meeting_type", "client_name", "meeting_date"],
    )

    op.create_table(
        "meeting_participants",
        sa.Column("participant_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("designation", sa.String(length=100), nullable=False),
        sa.Column("signature", sa.Text(), nullable=True),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["report_id"],
            ["meeting_reports.report_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("participant_id"),
    )
    op.create_index("ix_meeting_participants_participant_id", "meeting_participants", ["participant_id"])
    op.create_index("ix_meeting_participants_report_id", "meeting_participants", ["report_id"])
    op.create_index("ix_meeting_participants_name", "meeting_participants", ["name"])
    op.create_index("idx_participants_report_id", "meeting_participants", ["report_id"])

    op.create_table(
        "general_discussions",
        sa.Column("discussion_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("discussion_point", sa.Text(), nullable=False),
        sa.Column("decision", sa.Text(), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["report_id"],
            ["meeting_reports.report_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("discussion_id"),
    )
    op.create_index("ix_general_discussions_discussion_id", "general_discussions", ["discussion_id"])
    op.create_index("ix_general_discussions_report_id", "general_discussions", ["report_id"])
    op.create_index("idx_general_discussions_report_id", "general_discussions", ["report_id"])

    op.create_table(
        "business_discussions",
        sa.Column("discussion_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("discussion_point", sa.Text(), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["report_id"],
            ["meeting_reports.report_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("discussion_id"),
    )
    op.create_index("ix_business_discussions_discussion_id", "business_discussions", ["discussion_id"])
    op.create_index("ix_business_discussions_report_id", "business_discussions", ["report_id"])
    op.create_index("idx_business_discussions_report_id", "business_discussions", ["report_id"])

    op.create_table(
        "cooperation_agreement",
        sa.Column("agreement_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("agreement_details", sa.Text(), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["report_id"],
            ["meeting_reports.report_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("agreement_id"),
    )
    op.create_index("ix_cooperation_agreement_agreement_id", "cooperation_agreement", ["agreement_id"])
    op.create_index("ix_cooperation_agreement_report_id", "cooperation_agreement", ["report_id"])
    op.create_index("idx_cooperation_agreement_report_id", "cooperation_agreement", ["report_id"])

    op.create_table(
        "auditor_work_plan",
        sa.Column("plan_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("work_plan_details", sa.Text(), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(
            ["report_id"],
            ["meeting_reports.report_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("plan_id"),
    )
    op.create_index("ix_auditor_work_plan_plan_id", "auditor_work_plan", ["plan_id"])
    op.create_index("ix_auditor_work_plan_report_id", "auditor_work_plan", ["report_id"])
    op.create_index("idx_auditor_work_plan_report_id", "auditor_work_plan", ["report_id"])


def downgrade() -> None:
    op.drop_index("idx_auditor_work_plan_report_id", table_name="auditor_work_plan")
    op.drop_index("ix_auditor_work_plan_report_id", table_name="auditor_work_plan")
    op.drop_index("ix_auditor_work_plan_plan_id", table_name="auditor_work_plan")
    op.drop_table("auditor_work_plan")

    op.drop_index("idx_cooperation_agreement_report_id", table_name="cooperation_agreement")
    op.drop_index("ix_cooperation_agreement_report_id", table_name="cooperation_agreement")
    op.drop_index("ix_cooperation_agreement_agreement_id", table_name="cooperation_agreement")
    op.drop_table("cooperation_agreement")

    op.drop_index("idx_business_discussions_report_id", table_name="business_discussions")
    op.drop_index("ix_business_discussions_report_id", table_name="business_discussions")
    op.drop_index("ix_business_discussions_discussion_id", table_name="business_discussions")
    op.drop_table("business_discussions")

    op.drop_index("idx_general_discussions_report_id", table_name="general_discussions")
    op.drop_index("ix_general_discussions_report_id", table_name="general_discussions")
    op.drop_index("ix_general_discussions_discussion_id", table_name="general_discussions")
    op.drop_table("general_discussions")

    op.drop_index("idx_participants_report_id", table_name="meeting_participants")
    op.drop_index("ix_meeting_participants_name", table_name="meeting_participants")
    op.drop_index("ix_meeting_participants_report_id", table_name="meeting_participants")
    op.drop_index("ix_meeting_participants_participant_id", table_name="meeting_participants")
    op.drop_table("meeting_participants")

    op.drop_index("idx_meeting_reports_type_client_date", table_name="meeting_reports")
    op.drop_index("ix_meeting_reports_meeting_date", table_name="meeting_reports")
    op.drop_index("ix_meeting_reports_audit_year", table_name="meeting_reports")
    op.drop_index("ix_meeting_reports_client_name", table_name="meeting_reports")
    op.drop_index("ix_meeting_reports_meeting_type", table_name="meeting_reports")
    op.drop_index("ix_meeting_reports_report_id", table_name="meeting_reports")
    op.drop_table("meeting_reports")

    op.drop_index("idx_meeting_master_type_client_code_date", table_name="meeting_master")
    op.drop_index("ix_meeting_master_status", table_name="meeting_master")
    op.drop_index("ix_meeting_master_meeting_date", table_name="meeting_master")
    op.drop_index("ix_meeting_master_audit_year", table_name="meeting_master")
    op.drop_index("ix_meeting_master_client_code", table_name="meeting_master")
    op.drop_index("ix_meeting_master_client_id", table_name="meeting_master")
    op.drop_index("ix_meeting_master_meeting_type", table_name="meeting_master")
    op.drop_index("ix_meeting_master_meeting_id", table_name="meeting_master")
    op.drop_table("meeting_master")
