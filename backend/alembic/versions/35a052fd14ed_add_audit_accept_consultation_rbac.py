"""add audit accept consultation rbac

Revision ID: 35a052fd14ed
Revises: 6ce60f095546
Create Date: 2026-08-03 23:53:19.696370

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '35a052fd14ed'
down_revision: Union[str, Sequence[str], None] = '6ce60f095546'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

