"""Link users to employees.

Revision ID: c270useremployee
Revises: c269acceptrequired
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c270useremployee"
down_revision: Union[str, Sequence[str], None] = (
    "c269acceptrequired"
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "employee_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_users_employee_id",
        "users",
        "employees",
        ["employee_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.create_index(
        "ix_users_employee_id",
        "users",
        ["employee_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_users_employee_id",
        table_name="users",
    )

    op.drop_constraint(
        "fk_users_employee_id",
        "users",
        type_="foreignkey",
    )

    op.drop_column(
        "users",
        "employee_id",
    )