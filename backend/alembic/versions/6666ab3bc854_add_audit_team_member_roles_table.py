from alembic import op
import sqlalchemy as sa


revision = "6666ab3bc854"
down_revision = "ab25560d1a3e"
branch_labels = None
depends_on = None


def upgrade():

    op.create_table(
        "audit_team_member_roles",

        sa.Column(
            "role_id",
            sa.Integer(),
            primary_key=True,
        ),

        sa.Column(
            "role_name",
            sa.String(length=100),
            nullable=False,
            unique=True,
        ),

        sa.Column(
            "description",
            sa.String(length=255),
            nullable=True,
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default="true",
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


    op.bulk_insert(
        sa.table(
            "audit_team_member_roles",
            sa.column("role_name"),
            sa.column("description"),
        ),
        [
            {
                "role_name": "Team Lead",
                "description": "Lead audit team member",
            },
            {
                "role_name": "Team Supervisor",
                "description": "Supervises audit activities",
            },
            {
                "role_name": "Senior Auditor",
                "description": "Senior audit professional",
            },
            {
                "role_name": "Auditor",
                "description": "Audit execution member",
            },
            {
                "role_name": "Assistant Auditor",
                "description": "Supporting audit member",
            },
            {
                "role_name": "Reviewer",
                "description": "Reviews audit work",
            },
        ],
    )


def downgrade():

    op.drop_table(
        "audit_team_member_roles"
    )