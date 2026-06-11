"""replace soft delete with audit fields

Revision ID: eaad9868176e
Revises: f6c1fd69d570
Create Date: 2026-06-12 00:38:15.140762

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "eaad9868176e"
down_revision: Union[str, Sequence[str], None] = "f6c1fd69d570"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("created_by", sa.String(length=100), nullable=True)
    )
    op.add_column(
        "users", sa.Column("updated_by", sa.String(length=100), nullable=True)
    )

    op.execute("UPDATE users SET created_by = 'system' WHERE created_by IS NULL")
    op.execute("UPDATE users SET updated_by = 'system' WHERE updated_by IS NULL")

    op.drop_column("users", "is_deleted")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
    )
    op.drop_column("users", "updated_by")
    op.drop_column("users", "created_by")
