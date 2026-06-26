"""remove business fields from audit entities

Revision ID: b3689c5c7d95
Revises: 5332cc61c968
Create Date: 2026-06-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b3689c5c7d95"
down_revision: Union[str, Sequence[str], None] = "5332cc61c968"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _drop_fk_by_column(table_name: str, column_name: str) -> None:
    op.execute(
        f"""
        DO $$
        DECLARE
            fk_name text;
        BEGIN
            SELECT con.conname
            INTO fk_name
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
            JOIN pg_attribute att
              ON att.attrelid = rel.oid
             AND att.attnum = ANY(con.conkey)
            WHERE con.contype = 'f'
              AND nsp.nspname = current_schema()
              AND rel.relname = '{table_name}'
              AND att.attname = '{column_name}'
            LIMIT 1;

            IF fk_name IS NOT NULL THEN
                EXECUTE format(
                    'ALTER TABLE %I DROP CONSTRAINT %I',
                    '{table_name}',
                    fk_name
                );
            END IF;
        END $$;
        """
    )


def upgrade() -> None:
    _drop_fk_by_column("audit_entities", "business_nature_id")
    _drop_fk_by_column("audit_entities", "business_sector_id")
    _drop_fk_by_column("audit_entities", "business_industry_id")

    op.execute("DROP INDEX IF EXISTS ix_audit_entities_business_nature_id")
    op.execute("DROP INDEX IF EXISTS ix_audit_entities_business_sector_id")
    op.execute("DROP INDEX IF EXISTS ix_audit_entities_business_industry_id")

    op.drop_column("audit_entities", "business_nature_id")
    op.drop_column("audit_entities", "business_sector_id")
    op.drop_column("audit_entities", "business_industry_id")
    op.drop_column("audit_entities", "industry")


def downgrade() -> None:
    op.add_column(
        "audit_entities",
        sa.Column("industry", sa.String(length=150), nullable=True),
    )
    op.add_column(
        "audit_entities",
        sa.Column("business_industry_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "audit_entities",
        sa.Column("business_sector_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "audit_entities",
        sa.Column("business_nature_id", sa.Integer(), nullable=True),
    )

    op.create_index(
        op.f("ix_audit_entities_business_industry_id"),
        "audit_entities",
        ["business_industry_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_audit_entities_business_sector_id"),
        "audit_entities",
        ["business_sector_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_audit_entities_business_nature_id"),
        "audit_entities",
        ["business_nature_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_audit_entities_business_industry_id",
        "audit_entities",
        "business_industries",
        ["business_industry_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_foreign_key(
        "fk_audit_entities_business_sector_id",
        "audit_entities",
        "business_sectors",
        ["business_sector_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_foreign_key(
        "fk_audit_entities_business_nature_id",
        "audit_entities",
        "business_natures",
        ["business_nature_id"],
        ["id"],
        ondelete="RESTRICT",
    )
