"""add entity hierarchy fields to audit entities

Revision ID: 4ec506ba5603
Revises: 5596a801c61b
Create Date: 2026-06-25 17:29:22.313595

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4ec506ba5603"
down_revision: Union[str, Sequence[str], None] = "5596a801c61b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "audit_entities",
        sa.Column("parent_entity_id", sa.Integer(), nullable=True),
    )

    op.add_column(
        "audit_entities",
        sa.Column(
            "entity_class",
            sa.String(length=50),
            nullable=False,
            server_default="company",
        ),
    )

    op.add_column(
        "audit_entities",
        sa.Column("legal_status", sa.String(length=50), nullable=True),
    )

    op.create_index(
        op.f("ix_audit_entities_entity_class"),
        "audit_entities",
        ["entity_class"],
        unique=False,
    )
    op.create_index(
        op.f("ix_audit_entities_legal_status"),
        "audit_entities",
        ["legal_status"],
        unique=False,
    )
    op.create_index(
        op.f("ix_audit_entities_parent_entity_id"),
        "audit_entities",
        ["parent_entity_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_audit_entities_parent_entity_id",
        "audit_entities",
        "audit_entities",
        ["parent_entity_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.alter_column(
        "audit_entities",
        "entity_class",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "fk_audit_entities_parent_entity_id",
        "audit_entities",
        type_="foreignkey",
    )
    op.drop_index(
        op.f("ix_audit_entities_parent_entity_id"),
        table_name="audit_entities",
    )
    op.drop_index(
        op.f("ix_audit_entities_legal_status"),
        table_name="audit_entities",
    )
    op.drop_index(
        op.f("ix_audit_entities_entity_class"),
        table_name="audit_entities",
    )
    op.drop_column("audit_entities", "legal_status")
    op.drop_column("audit_entities", "entity_class")
    op.drop_column("audit_entities", "parent_entity_id")
