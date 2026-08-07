"""add audit accept consultations

Revision ID: 6ce60f095546
Revises: c270useremployee
Create Date: 2026-08-01

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6ce60f095546"
down_revision: Union[str, None] = "c270useremployee"
branch_labels = None
depends_on = None


def upgrade() -> None:

    op.create_table(
        "audit_accept_consultations",

        sa.Column(
            "consultation_id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
        ),

        sa.Column(
            "completion_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "audit_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "consultant_employee_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "assigned_by_user_id",
            sa.String(length=50),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.String(length=30),
            server_default="pending",
            nullable=False,
        ),

        sa.Column(
            "decision",
            sa.String(length=30),
            nullable=True,
        ),

        sa.Column(
            "remarks",
            sa.Text(),
            nullable=True,
        ),

        sa.Column(
            "reviewed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),

        sa.Column(
            "created_by",
            sa.String(length=100),
            nullable=True,
        ),

        sa.Column(
            "updated_by",
            sa.String(length=100),
            nullable=True,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
        ),

        sa.PrimaryKeyConstraint(
            "consultation_id"
        ),

        sa.ForeignKeyConstraint(
            [
                "completion_id"
            ],
            [
                "audit_accept_completions.completion_id"
            ],
            ondelete="CASCADE",
        ),

        sa.ForeignKeyConstraint(
            [
                "audit_id"
            ],
            [
                "audit_master.audit_id"
            ],
            ondelete="RESTRICT",
        ),

        sa.ForeignKeyConstraint(
            [
                "consultant_employee_id"
            ],
            [
                "employees.id"
            ],
            ondelete="RESTRICT",
        ),
    )


    op.create_index(
        "ix_audit_accept_consultations_completion_id",
        "audit_accept_consultations",
        ["completion_id"],
    )


    op.create_index(
        "ix_audit_accept_consultations_consultant_employee_id",
        "audit_accept_consultations",
        ["consultant_employee_id"],
    )


def downgrade() -> None:

    op.drop_index(
        "ix_audit_accept_consultations_consultant_employee_id",
        table_name="audit_accept_consultations",
    )

    op.drop_index(
        "ix_audit_accept_consultations_completion_id",
        table_name="audit_accept_consultations",
    )

    op.drop_table(
        "audit_accept_consultations"
    )
