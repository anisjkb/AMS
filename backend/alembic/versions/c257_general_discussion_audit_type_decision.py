"""add audit type and decision to general discussion

Revision ID: c257_general_disc_audit_type
Revises: c256_client_mgmt_nav
Create Date: 2026-07-08
"""

from alembic import op
import sqlalchemy as sa


revision = "c257_general_disc_audit_type"
down_revision = "c256_client_mgmt_nav"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "general_discussion",
        sa.Column("audit_type", sa.String(length=150), nullable=True),
    )
    op.add_column(
        "general_discussion",
        sa.Column("decision", sa.Text(), nullable=True),
    )

    op.execute(
        """
        UPDATE general_discussion gd
        SET audit_type = COALESCE(NULLIF(BTRIM(am.audit_type), ''), 'General Audit')
        FROM audit_master am
        WHERE gd.audit_id = am.audit_id
          AND (gd.audit_type IS NULL OR BTRIM(gd.audit_type) = '')
        """
    )

    op.execute(
        """
        UPDATE general_discussion
        SET audit_type = 'General Audit'
        WHERE audit_type IS NULL OR BTRIM(audit_type) = ''
        """
    )

    op.alter_column(
        "general_discussion",
        "audit_type",
        existing_type=sa.String(length=150),
        nullable=False,
    )

    op.alter_column(
        "general_discussion",
        "audit_id",
        existing_type=sa.Integer(),
        nullable=True,
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE general_discussion
        SET audit_id = 0
        WHERE audit_id IS NULL
        """
    )

    op.alter_column(
        "general_discussion",
        "audit_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    op.drop_column("general_discussion", "decision")
    op.drop_column("general_discussion", "audit_type")
