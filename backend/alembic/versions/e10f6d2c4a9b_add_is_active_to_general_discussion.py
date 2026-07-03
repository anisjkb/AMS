"""add is_active to general_discussion

Revision ID: e10f6d2c4a9b
Revises: d9a023c30bc8
Create Date: 2026-07-03
"""

from alembic import op


revision = "e10f6d2c4a9b"
down_revision = "d9a023c30bc8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        alter table general_discussion
        add column if not exists is_active boolean not null default true
    """)
    op.execute("""
        update general_discussion
        set is_active = true
        where is_active is null
    """)


def downgrade() -> None:
    op.execute("""
        alter table general_discussion
        drop column if exists is_active
    """)
