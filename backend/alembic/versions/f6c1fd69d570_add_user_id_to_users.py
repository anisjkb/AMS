"""add user_id to users

Revision ID: f6c1fd69d570
Revises: 5d2a90d99f7d
Create Date: 2026-06-11 23:16:57.457390

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "f6c1fd69d570"
down_revision: Union[str, Sequence[str], None] = "5d2a90d99f7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("user_id", sa.String(length=100), nullable=True))
    op.create_index(op.f("ix_users_user_id"), "users", ["user_id"], unique=True)

    op.execute("UPDATE users SET user_id = 'admin' WHERE email = 'admin@ams.com'")

    op.alter_column("users", "user_id", nullable=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_user_id"), table_name="users")
    op.drop_column("users", "user_id")
