"""change general discussion title to text

Revision ID: c258_general_disc_title_text
Revises: c257_general_disc_audit_type
Create Date: 2026-07-08
"""

from alembic import op
import sqlalchemy as sa


revision = "c258_general_disc_title_text"
down_revision = "c257_general_disc_audit_type"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "general_discussion",
        "title",
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE general_discussion
        SET title = LEFT(title, 255)
        WHERE LENGTH(title) > 255
        """
    )

    op.alter_column(
        "general_discussion",
        "title",
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
