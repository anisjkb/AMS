"""add audit visit rbac

Revision ID: f580310668c1
Revises: 4d3c16f18cc6
Create Date: 2026-07-13 00:32:52.556329

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f580310668c1'
down_revision: Union[str, Sequence[str], None] = '4d3c16f18cc6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    conn = op.get_bind()

    permissions = [
        (
            "menu.audit_visit.view",
            "menu",
            "audit_visit",
            "view",
            "View Audit Visits",
        ),
        (
            "api.audit_visit.view",
            "api",
            "audit_visit",
            "view",
            "View Audit Visits API",
        ),
        (
            "api.audit_visit.create",
            "api",
            "audit_visit",
            "create",
            "Create Audit Visit",
        ),
        (
            "api.audit_visit.update",
            "api",
            "audit_visit",
            "update",
            "Update Audit Visit",
        ),
        (
            "api.audit_visit.delete",
            "api",
            "audit_visit",
            "delete",
            "Delete Audit Visit",
        ),
        (
            "api.audit_visit.restore",
            "api",
            "audit_visit",
            "restore",
            "Restore Audit Visit",
        ),
        (
            "api.audit_visit.permanent_delete",
            "api",
            "audit_visit",
            "permanent_delete",
            "Permanent Delete Audit Visit",
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

    conn.execute(
        sa.text("""
            insert into menus
            (
                navigation_group_id,
                parent_menu_id,
                menu_key,
                menu_title,
                route_path,
                icon,
                permission_key,
                sort_order,
                menu_level,
                is_expandable,
                is_visible,
                is_active,
                created_at,
                updated_at
            )
            values
            (
                8,
                39,
                'audit_visit',
                'Audit Visits',
                '/audit-core/visits',
                'CalendarDays',
                'menu.audit_visit.view',
                40,
                3,
                false,
                true,
                true,
                now(),
                now()
            )
            on conflict (menu_key) do nothing
        """)
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
            where permission_key like '%.audit_visit.%'
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

    conn.execute(
        sa.text("""
            update menus
            set
                is_active=false,
                is_visible=false
            where menu_key in
            (
                'audit_visit_info',
                'audit_visit_observation'
            )
        """)
    )


def downgrade() -> None:
    """Downgrade schema."""

    conn = op.get_bind()

    conn.execute(
        sa.text("""
            update menus
            set
                is_active=true,
                is_visible=true
            where menu_key in
            (
                'audit_visit_info',
                'audit_visit_observation'
            )
        """)
    )

    conn.execute(
        sa.text("""
            delete from role_permissions
            where permission_id in
            (
                select id
                from permissions
                where permission_key like '%.audit_visit.%'
            )
        """)
    )

    conn.execute(
        sa.text("""
            delete from menus
            where menu_key='audit_visit'
        """)
    )

    conn.execute(
        sa.text("""
            delete from permissions
            where permission_key like '%.audit_visit.%'
        """)
    )
