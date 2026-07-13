"""remove audit type from audit visit observations

Revision ID: 4d3c16f18cc6
Revises: ce22365d0960
Create Date: 2026-07-12 22:40:56.353952

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d3c16f18cc6'
down_revision: Union[str, Sequence[str], None] = 'ce22365d0960'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column(
        "audit_visit_observations",
        "audit_type",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "audit_visit_observations",
        sa.Column(
            "audit_type",
            sa.String(length=50),
            nullable=True,
        ),
    )
