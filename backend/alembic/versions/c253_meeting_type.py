"""create meeting type and update meeting master

Revision ID: c253_meeting_type
Revises: e10f6d2c4a9b
Create Date: 2026-07-05
"""

from alembic import op
import sqlalchemy as sa


revision = "c253_meeting_type"
down_revision = "e10f6d2c4a9b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meeting_type",
        sa.Column("meeting_type_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("meeting_type_name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="active", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("meeting_type_id"),
        sa.UniqueConstraint("meeting_type_name", name="uq_meeting_type_name"),
    )

    op.create_index("ix_meeting_type_meeting_type_id", "meeting_type", ["meeting_type_id"], unique=False)
    op.create_index("ix_meeting_type_meeting_type_name", "meeting_type", ["meeting_type_name"], unique=False)
    op.create_index("ix_meeting_type_status", "meeting_type", ["status"], unique=False)

    op.execute(
        """
        INSERT INTO meeting_type (
            meeting_type_name,
            description,
            status,
            is_active,
            created_at,
            updated_at
        )
        SELECT DISTINCT
            TRIM(meeting_type) AS meeting_type_name,
            NULL AS description,
            'active' AS status,
            TRUE AS is_active,
            NOW() AS created_at,
            NOW() AS updated_at
        FROM meeting_master
        WHERE meeting_type IS NOT NULL
          AND TRIM(meeting_type) <> ''
        ON CONFLICT (meeting_type_name) DO NOTHING
        """
    )

    with op.batch_alter_table("meeting_master") as batch_op:
        batch_op.add_column(sa.Column("meeting_name", sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column("meeting_type_id", sa.Integer(), nullable=True))

    op.execute(
        """
        UPDATE meeting_master mm
        SET meeting_type_id = mt.meeting_type_id
        FROM meeting_type mt
        WHERE TRIM(mm.meeting_type) = mt.meeting_type_name
          AND mm.meeting_type_id IS NULL
        """
    )

    op.execute(
        """
        UPDATE meeting_master
        SET meeting_name = LEFT(
            CONCAT(
                COALESCE(NULLIF(TRIM(meeting_type), ''), 'Meeting'),
                ' - ',
                client_code,
                ' - ',
                audit_year
            ),
            150
        )
        WHERE meeting_name IS NULL
           OR TRIM(meeting_name) = ''
        """
    )

    with op.batch_alter_table("meeting_master") as batch_op:
        batch_op.alter_column("meeting_name", existing_type=sa.String(length=150), nullable=False)
        batch_op.alter_column("meeting_type_id", existing_type=sa.Integer(), nullable=False)
        batch_op.create_index("ix_meeting_master_meeting_name", ["meeting_name"], unique=False)
        batch_op.create_index("ix_meeting_master_meeting_type_id", ["meeting_type_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_meeting_master_meeting_type_id_meeting_type",
            "meeting_type",
            ["meeting_type_id"],
            ["meeting_type_id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("meeting_master") as batch_op:
        batch_op.drop_constraint("fk_meeting_master_meeting_type_id_meeting_type", type_="foreignkey")
        batch_op.drop_index("ix_meeting_master_meeting_type_id")
        batch_op.drop_index("ix_meeting_master_meeting_name")
        batch_op.drop_column("meeting_type_id")
        batch_op.drop_column("meeting_name")

    op.drop_index("ix_meeting_type_status", table_name="meeting_type")
    op.drop_index("ix_meeting_type_meeting_type_name", table_name="meeting_type")
    op.drop_index("ix_meeting_type_meeting_type_id", table_name="meeting_type")
    op.drop_table("meeting_type")
