"""seed entrance meeting minutes actions

Revision ID: c260_emm_actions
Revises: c259_entrance_meeting_minutes
Create Date: 2026-07-09
"""

from alembic import op
import sqlalchemy as sa


revision = "c260_emm_actions"
down_revision = "c259_entrance_meeting_minutes"
branch_labels = None
depends_on = None


SEED_BY = "c260_entrance_meeting_minutes_actions"


def upgrade() -> None:
    bind = op.get_bind()

    action_rows = [
        ("create", "Create", "button.entrance_meeting_minutes.create", "blue", "Plus", 10),
        ("update", "Edit", "button.entrance_meeting_minutes.update", "amber", "Pencil", 20),
        ("delete", "Inactive", "button.entrance_meeting_minutes.delete", "red", "Trash2", 30),
        ("restore", "Restore", "button.entrance_meeting_minutes.restore", "green", "RotateCcw", 40),
        ("permanent_delete", "Permanent Delete", "button.entrance_meeting_minutes.permanent_delete", "red", "AlertTriangle", 50),
        ("export", "Export", "button.entrance_meeting_minutes.export", "slate", "Download", 60),
        ("import", "Import", "button.entrance_meeting_minutes.import", "slate", "Upload", 70),
    ]

    menu_id = bind.execute(
        sa.text(
            """
            select id
            from menus
            where menu_key = 'entrance_meeting_minutes'
               or route_path = '/audit-meetings/minutes/entrance'
            order by id
            limit 1
            """
        )
    ).scalar_one_or_none()

    if menu_id is None:
        raise RuntimeError("Entrance Meeting Minutes menu not found. Run c259 first.")

    menu_permission_id = bind.execute(
        sa.text(
            """
            select id
            from permissions
            where permission_key = 'menu.entrance_meeting_minutes.view'
            limit 1
            """
        )
    ).scalar_one_or_none()

    if menu_permission_id is not None:
        bind.execute(
            sa.text(
                """
                insert into menu_permissions (
                    menu_id,
                    permission_id,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                select
                    :menu_id,
                    :permission_id,
                    true,
                    :seed_by,
                    :seed_by,
                    now(),
                    now()
                where not exists (
                    select 1
                    from menu_permissions
                    where menu_id = :menu_id
                      and permission_id = :permission_id
                )
                """
            ),
            {
                "menu_id": menu_id,
                "permission_id": menu_permission_id,
                "seed_by": SEED_BY,
            },
        )

    for action_key, action_title, permission_key, button_color, button_icon, sort_order in action_rows:
        permission_id = bind.execute(
            sa.text(
                """
                select id
                from permissions
                where permission_key = :permission_key
                limit 1
                """
            ),
            {"permission_key": permission_key},
        ).scalar_one_or_none()

        if permission_id is None:
            raise RuntimeError(f"Permission not found: {permission_key}")

        existing_action_id = bind.execute(
            sa.text(
                """
                select id
                from menu_actions
                where menu_id = :menu_id
                  and action_key = :action_key
                limit 1
                """
            ),
            {
                "menu_id": menu_id,
                "action_key": action_key,
            },
        ).scalar_one_or_none()

        if existing_action_id is None:
            action_id = bind.execute(
                sa.text(
                    """
                    insert into menu_actions (
                        menu_id,
                        action_key,
                        action_title,
                        permission_key,
                        button_color,
                        button_icon,
                        sort_order,
                        is_visible,
                        is_active,
                        created_by,
                        updated_by,
                        created_at,
                        updated_at
                    )
                    values (
                        :menu_id,
                        :action_key,
                        :action_title,
                        :permission_key,
                        :button_color,
                        :button_icon,
                        :sort_order,
                        true,
                        true,
                        :seed_by,
                        :seed_by,
                        now(),
                        now()
                    )
                    returning id
                    """
                ),
                {
                    "menu_id": menu_id,
                    "action_key": action_key,
                    "action_title": action_title,
                    "permission_key": permission_key,
                    "button_color": button_color,
                    "button_icon": button_icon,
                    "sort_order": sort_order,
                    "seed_by": SEED_BY,
                },
            ).scalar_one()
        else:
            action_id = existing_action_id
            bind.execute(
                sa.text(
                    """
                    update menu_actions
                    set action_title = :action_title,
                        permission_key = :permission_key,
                        button_color = :button_color,
                        button_icon = :button_icon,
                        sort_order = :sort_order,
                        is_visible = true,
                        is_active = true,
                        updated_by = :seed_by,
                        updated_at = now()
                    where id = :action_id
                    """
                ),
                {
                    "action_id": action_id,
                    "action_title": action_title,
                    "permission_key": permission_key,
                    "button_color": button_color,
                    "button_icon": button_icon,
                    "sort_order": sort_order,
                    "seed_by": SEED_BY,
                },
            )

        bind.execute(
            sa.text(
                """
                insert into menu_action_permissions (
                    menu_action_id,
                    permission_id,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                select
                    :action_id,
                    :permission_id,
                    true,
                    :seed_by,
                    :seed_by,
                    now(),
                    now()
                where not exists (
                    select 1
                    from menu_action_permissions
                    where menu_action_id = :action_id
                      and permission_id = :permission_id
                )
                """
            ),
            {
                "action_id": action_id,
                "permission_id": permission_id,
                "seed_by": SEED_BY,
            },
        )

    bind.execute(
        sa.text(
            """
            insert into role_permissions (
                role_id,
                permission_id,
                is_active,
                created_by,
                updated_by,
                created_at,
                updated_at
            )
            select
                1,
                p.id,
                true,
                :seed_by,
                :seed_by,
                now(),
                now()
            from permissions p
            where p.resource_key = 'entrance_meeting_minutes'
              and not exists (
                  select 1
                  from role_permissions rp
                  where rp.role_id = 1
                    and rp.permission_id = p.id
              )
            """
        ),
        {"seed_by": SEED_BY},
    )


def downgrade() -> None:
    bind = op.get_bind()

    menu_id = bind.execute(
        sa.text(
            """
            select id
            from menus
            where menu_key = 'entrance_meeting_minutes'
               or route_path = '/audit-meetings/minutes/entrance'
            order by id
            limit 1
            """
        )
    ).scalar_one_or_none()

    if menu_id is not None:
        bind.execute(
            sa.text(
                """
                delete from menu_action_permissions
                where menu_action_id in (
                    select id from menu_actions where menu_id = :menu_id
                )
                """
            ),
            {"menu_id": menu_id},
        )

        bind.execute(
            sa.text(
                """
                delete from menu_actions
                where menu_id = :menu_id
                """
            ),
            {"menu_id": menu_id},
        )
