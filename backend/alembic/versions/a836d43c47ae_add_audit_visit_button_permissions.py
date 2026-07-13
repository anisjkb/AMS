"""add audit visit button permissions

Revision ID: a836d43c47ae
Revises: f580310668c1
Create Date: 2026-07-13 00:43:51.120795

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a836d43c47ae'
down_revision: Union[str, Sequence[str], None] = 'f580310668c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    conn = op.get_bind()

    permissions = [
        (
            "button.audit_visit.view",
            "button",
            "audit_visit",
            "view",
            "View Audit Visit Button",
        ),
        (
            "button.audit_visit.create",
            "button",
            "audit_visit",
            "create",
            "Create Audit Visit Button",
        ),
        (
            "button.audit_visit.update",
            "button",
            "audit_visit",
            "update",
            "Update Audit Visit Button",
        ),
        (
            "button.audit_visit.delete",
            "button",
            "audit_visit",
            "delete",
            "Delete Audit Visit Button",
        ),
        (
            "button.audit_visit.restore",
            "button",
            "audit_visit",
            "restore",
            "Restore Audit Visit Button",
        ),
        (
            "button.audit_visit.permanent_delete",
            "button",
            "audit_visit",
            "permanent_delete",
            "Permanent Delete Audit Visit Button",
        ),
        (
            "button.audit_visit.export",
            "button",
            "audit_visit",
            "export",
            "Export Audit Visit Button",
        ),
        (
            "button.audit_visit.import",
            "button",
            "audit_visit",
            "import",
            "Import Audit Visit Button",
        ),
    ]

    for key, resource_type, resource_key, action, description in permissions:
        conn.execute(
            sa.text("""
                insert into permissions
                (
                    permission_key,
                    resource_type,
                    resource_key,
                    action,
                    description,
                    is_active,
                    created_at,
                    updated_at
                )
                values
                (
                    :key,
                    :resource_type,
                    :resource_key,
                    :action,
                    :description,
                    true,
                    now(),
                    now()
                )
                on conflict (permission_key) do nothing
            """),
            {
                "key": key,
                "resource_type": resource_type,
                "resource_key": resource_key,
                "action": action,
                "description": description,
            },
        )

    super_admin_id = conn.execute(
        sa.text("""
            select id
            from roles
            where role_name='Super Admin'
            limit 1
        """)
    ).scalar()

    permission_ids = conn.execute(
        sa.text("""
            select id
            from permissions
            where permission_key like 'button.audit_visit.%'
        """)
    ).fetchall()

    for permission_id, in permission_ids:
        conn.execute(
            sa.text("""
                insert into role_permissions
                (
                    role_id,
                    permission_id,
                    is_active,
                    created_at,
                    updated_at
                )
                values
                (
                    :role_id,
                    :permission_id,
                    true,
                    now(),
                    now()
                )
                on conflict (role_id, permission_id) do nothing
            """),
            {
                "role_id": super_admin_id,
                "permission_id": permission_id,
            },
        )


def downgrade() -> None:
    """Downgrade schema."""

    conn = op.get_bind()

    conn.execute(
        sa.text("""
            delete from role_permissions
            where permission_id in
            (
                select id
                from permissions
                where permission_key like 'button.audit_visit.%'
            )
        """)
    )

    conn.execute(
        sa.text("""
            delete from permissions
            where permission_key like 'button.audit_visit.%'
        """)
    )
