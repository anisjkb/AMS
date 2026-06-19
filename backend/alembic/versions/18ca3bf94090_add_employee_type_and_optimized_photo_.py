"""add employee type and optimized photo fields

Revision ID: 18ca3bf94090
Revises: 660eb9ae2e48
Create Date: 2026-06-19 00:18:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "18ca3bf94090"
down_revision: Union[str, Sequence[str], None] = "660eb9ae2e48"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely."""

    # New optimized employee photo fields
    op.add_column(
        "employees",
        sa.Column("photo_thumb_url", sa.String(length=500), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("passport_photo_url", sa.String(length=500), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("photo_original_name", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("photo_mime_type", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("photo_size_bytes", sa.Integer(), nullable=True),
    )

    # Increase URL length for safer storage paths
    op.alter_column(
        "employees",
        "photo_url",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.String(length=500),
        existing_nullable=True,
    )
    op.alter_column(
        "employees",
        "signature_url",
        existing_type=sa.VARCHAR(length=255),
        type_=sa.String(length=500),
        existing_nullable=True,
    )

    # Safe rename: employee_status -> employee_type
    # Do NOT drop old data.
    op.alter_column(
        "employees",
        "employee_status",
        new_column_name="employee_type",
        existing_type=sa.VARCHAR(length=20),
        existing_nullable=False,
    )

    # Increase renamed column length
    op.alter_column(
        "employees",
        "employee_type",
        existing_type=sa.VARCHAR(length=20),
        type_=sa.String(length=50),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema safely."""

    # Reduce employee_type length before rename back
    op.alter_column(
        "employees",
        "employee_type",
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False,
    )

    # Safe rename back: employee_type -> employee_status
    op.alter_column(
        "employees",
        "employee_type",
        new_column_name="employee_status",
        existing_type=sa.VARCHAR(length=20),
        existing_nullable=False,
    )

    # Revert URL length
    op.alter_column(
        "employees",
        "signature_url",
        existing_type=sa.String(length=500),
        type_=sa.VARCHAR(length=255),
        existing_nullable=True,
    )
    op.alter_column(
        "employees",
        "photo_url",
        existing_type=sa.String(length=500),
        type_=sa.VARCHAR(length=255),
        existing_nullable=True,
    )

    # Drop optimized photo fields
    op.drop_column("employees", "photo_size_bytes")
    op.drop_column("employees", "photo_mime_type")
    op.drop_column("employees", "photo_original_name")
    op.drop_column("employees", "passport_photo_url")
    op.drop_column("employees", "photo_thumb_url")