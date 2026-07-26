"""add employee signer to acceptance signoffs

Revision ID: c267acceptemployee
Revises: c266acceptcompletion
Create Date: 2026-07-24
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "c267acceptemployee"
down_revision: str | None = "c266acceptcompletion"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "audit_accept_signoffs",
        sa.Column(
            "signed_by_employee_id",
            sa.Integer(),
            nullable=False,
        ),
    )

    op.create_foreign_key(
        (
            "fk_audit_accept_signoffs_"
            "signed_by_employee_id"
        ),
        "audit_accept_signoffs",
        "employees",
        ["signed_by_employee_id"],
        ["id"],
    )

    op.create_index(
        (
            "ix_audit_accept_signoffs_"
            "signed_by_employee_id"
        ),
        "audit_accept_signoffs",
        ["signed_by_employee_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        (
            "ix_audit_accept_signoffs_"
            "signed_by_employee_id"
        ),
        table_name="audit_accept_signoffs",
    )

    op.drop_constraint(
        (
            "fk_audit_accept_signoffs_"
            "signed_by_employee_id"
        ),
        "audit_accept_signoffs",
        type_="foreignkey",
    )

    op.drop_column(
        "audit_accept_signoffs",
        "signed_by_employee_id",
    )
