"""extend permission resource fields

Revision ID: 488f8a110f88
Revises: 659a5f2fd8f3
Create Date: 2026-06-12 01:21:14.815317

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "488f8a110f88"
down_revision: Union[str, Sequence[str], None] = "659a5f2fd8f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "permissions", sa.Column("resource_key", sa.String(length=100), nullable=True)
    )
    op.add_column(
        "permissions", sa.Column("action", sa.String(length=30), nullable=True)
    )

    op.execute("""
        UPDATE permissions
        SET
            resource_key = CASE
                WHEN permission_key = 'company.create' THEN 'company'
                WHEN permission_key = 'company.view' THEN 'company'
                ELSE split_part(permission_key, '.', 1)
            END,
            action = CASE
                WHEN permission_key = 'company.create' THEN 'create'
                WHEN permission_key = 'company.view' THEN 'view'
                ELSE split_part(permission_key, '.', 2)
            END
        WHERE resource_key IS NULL OR action IS NULL
    """)

    op.alter_column("permissions", "resource_key", nullable=False)
    op.alter_column("permissions", "action", nullable=False)


def downgrade() -> None:
    op.drop_column("permissions", "action")
    op.drop_column("permissions", "resource_key")
