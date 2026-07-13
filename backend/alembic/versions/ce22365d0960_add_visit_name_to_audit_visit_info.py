"""add visit name to audit visit info

Revision ID: ce22365d0960
Revises: c260_emm_actions
Create Date: 2026-07-12 15:50:23.346468

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce22365d0960'
down_revision: Union[str, Sequence[str], None] = 'c260_emm_actions'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "audit_visit_info",
        sa.Column(
            "visit_name",
            sa.String(length=150),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "audit_visit_info",
        "visit_name",
    )
