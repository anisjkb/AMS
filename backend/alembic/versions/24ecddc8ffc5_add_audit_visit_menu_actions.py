"""add audit visit menu actions

Revision ID: 24ecddc8ffc5
Revises: a836d43c47ae
Create Date: 2026-07-13 01:13:29.352690

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '24ecddc8ffc5'
down_revision: Union[str, Sequence[str], None] = 'a836d43c47ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    conn = op.get_bind()

    menu_id = conn.execute(
        sa.text("""
            select id
            from menus
            where menu_key='audit_visit'
            limit 1
        """)
    ).scalar()

    actions = [
        (
            "create",
            "Create",
            "button.audit_visit.create",
            "primary",
            "Plus",
            10,
        ),
        (
            "update",
            "Edit",
            "button.audit_visit.update",
            "warning",
            "Pencil",
            20,
        ),
        (
            "delete",
            "Delete",
            "button.audit_visit.delete",
            "danger",
            "Trash2",
            30,
        ),
        (
            "restore",
            "Restore",
            "button.audit_visit.restore",
            "success",
            "RotateCcw",
            40,
        ),
        (
            "permanent_delete",
            "Permanent Delete",
            "button.audit_visit.permanent_delete",
            "danger",
            "BadgeX",
            50,
        ),
        (
            "export",
            "Export",
            "button.audit_visit.export",
            "secondary",
            "Download",
            60,
        ),
        (
            "import",
            "Import",
            "button.audit_visit.import",
            "secondary",
            "Upload",
            70,
        ),
    ]

    for (
        action_key,
        action_title,
        permission_key,
        button_color,
        button_icon,
        sort_order,
    ) in actions:

        conn.execute(
            sa.text("""
                insert into menu_actions
                (
                    menu_id,
                    action_key,
                    action_title,
                    permission_key,
                    button_color,
                    button_icon,
                    sort_order,
                    is_visible,
                    is_active,
                    created_at,
                    updated_at
                )
                values
                (
                    :menu_id,
                    :action_key,
                    :action_title,
                    :permission_key,
                    :button_color,
                    :button_icon,
                    :sort_order,
                    true,
                    true,
                    now(),
                    now()
                )
                on conflict do nothing
            """),
            {
                "menu_id": menu_id,
                "action_key": action_key,
                "action_title": action_title,
                "permission_key": permission_key,
                "button_color": button_color,
                "button_icon": button_icon,
                "sort_order": sort_order,
            },
        )


    conn.execute(
        sa.text("""
            insert into menu_action_permissions
            (
                menu_action_id,
                permission_id,
                is_active,
                created_at,
                updated_at
            )
            select
                ma.id,
                p.id,
                true,
                now(),
                now()
            from menu_actions ma
            join permissions p
                on p.permission_key = ma.permission_key
            where ma.menu_id = :menu_id
            on conflict do nothing
        """),
        {
            "menu_id": menu_id,
        },
    )


def downgrade() -> None:
    """Downgrade schema."""

    conn = op.get_bind()

    conn.execute(
        sa.text("""
            delete from menu_action_permissions
            where menu_action_id in
            (
                select id
                from menu_actions
                where menu_id =
                (
                    select id
                    from menus
                    where menu_key='audit_visit'
                )
            )
        """)
    )

    conn.execute(
        sa.text("""
            delete from menu_actions
            where menu_id =
            (
                select id
                from menus
                where menu_key='audit_visit'
            )
        """)
    )
