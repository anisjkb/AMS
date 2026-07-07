"""create audit type table

Revision ID: c254_audit_type
Revises: c253c_part_sources
Create Date: 2026-07-07
"""

from alembic import op
import sqlalchemy as sa


revision = "c254_audit_type"
down_revision = "c253c_part_sources"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_type",
        sa.Column("audit_type_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("audit_type_name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="active", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("audit_type_id"),
        sa.UniqueConstraint("audit_type_name", name="uq_audit_type_name"),
    )

    op.create_index("ix_audit_type_audit_type_id", "audit_type", ["audit_type_id"], unique=False)
    op.create_index("ix_audit_type_audit_type_name", "audit_type", ["audit_type_name"], unique=False)
    op.create_index("ix_audit_type_status", "audit_type", ["status"], unique=False)

    op.execute(
        """
        INSERT INTO audit_type (
            audit_type_name,
            description,
            status,
            is_active,
            created_at,
            updated_at
        )
        SELECT DISTINCT
            TRIM(audit_type) AS audit_type_name,
            NULL AS description,
            'active' AS status,
            TRUE AS is_active,
            NOW() AS created_at,
            NOW() AS updated_at
        FROM audit_master
        WHERE audit_type IS NOT NULL
          AND TRIM(audit_type) <> ''
        ON CONFLICT (audit_type_name) DO NOTHING
        """
    )

    op.execute(
        """
        INSERT INTO audit_type (
            audit_type_name,
            description,
            status,
            is_active,
            created_at,
            updated_at
        )
        VALUES
            ('Compliance Audit', 'Audit type for compliance-focused audit engagements.', 'active', TRUE, NOW(), NOW()),
            ('Financial Audit', 'Audit type for financial audit engagements.', 'active', TRUE, NOW(), NOW()),
            ('Operational Audit', 'Audit type for operational audit engagements.', 'active', TRUE, NOW(), NOW()),
            ('Management Audit', 'Audit type for management audit engagements.', 'active', TRUE, NOW(), NOW()),
            ('Internal Audit', 'Audit type for internal audit engagements.', 'active', TRUE, NOW(), NOW()),
            ('IT Audit', 'Audit type for information technology audit engagements.', 'active', TRUE, NOW(), NOW()),
            ('Special Audit', 'Audit type for special audit engagements.', 'active', TRUE, NOW(), NOW())
        ON CONFLICT (audit_type_name) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_index("ix_audit_type_status", table_name="audit_type")
    op.drop_index("ix_audit_type_audit_type_name", table_name="audit_type")
    op.drop_index("ix_audit_type_audit_type_id", table_name="audit_type")
    op.drop_table("audit_type")
