"""add acceptance procedures actions and super admin permissions

Revision ID: c265acceptactions
Revises: 582919a33092
Create Date: 2026-07-23
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "c265acceptactions"
down_revision: str | None = "582919a33092"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


MODULE_KEY = "audit_accept_proce"
SEED_BY = "migration:c265acceptactions"

ACTIONS = (
    {
        "action_key": "view",
        "action_title": "View",
        "permission_key": "api.audit_accept_proce.view",
        "button_color": "blue",
        "button_icon": "Eye",
        "sort_order": 10,
    },
    {
        "action_key": "update",
        "action_title": "Update",
        "permission_key": "api.audit_accept_proce.update",
        "button_color": "emerald",
        "button_icon": "Save",
        "sort_order": 20,
    },
)

PERMISSION_KEYS = (
    "menu.audit_accept_proce.view",
    "api.audit_accept_proce.view",
    "api.audit_accept_proce.update",
)


def upgrade() -> None:
    """Seed Acceptance Procedures actions and Super Admin permissions."""

    bind = op.get_bind()

    menu_id = bind.execute(
        sa.text(
            """
            select id
            from menus
            where menu_key = :module_key
               or route_path = '/audit-planning/audit-accept-proce'
            order by id
            limit 1
            """
        ),
        {"module_key": MODULE_KEY},
    ).scalar_one_or_none()

    if menu_id is None:
        raise RuntimeError(
            "Acceptance Procedures menu was not found. "
            "Run revision cf6eaefed27e first."
        )

    super_admin_role_id = bind.execute(
        sa.text(
            """
            select id
            from roles
            where lower(trim(role_name)) = lower('Super Admin')
            order by id
            limit 1
            """
        )
    ).scalar_one_or_none()

    if super_admin_role_id is None:
        raise RuntimeError("Super Admin role was not found.")

    permission_rows = bind.execute(
        sa.text(
            """
            select id, permission_key
            from permissions
            where permission_key in (
                'menu.audit_accept_proce.view',
                'api.audit_accept_proce.view',
                'api.audit_accept_proce.update'
            )
            """
        )
    ).mappings().all()

    permission_ids = {
        row["permission_key"]: row["id"]
        for row in permission_rows
    }

    missing_permissions = [
        permission_key
        for permission_key in PERMISSION_KEYS
        if permission_key not in permission_ids
    ]

    if missing_permissions:
        raise RuntimeError(
            "Missing Acceptance Procedures permissions: "
            + ", ".join(missing_permissions)
        )

    for action in ACTIONS:
        action_id = bind.execute(
            sa.text(
                """
                select id
                from menu_actions
                where menu_id = :menu_id
                  and action_key = :action_key
                order by id
                limit 1
                """
            ),
            {
                "menu_id": menu_id,
                "action_key": action["action_key"],
            },
        ).scalar_one_or_none()

        action_values = {
            "menu_id": menu_id,
            "action_key": action["action_key"],
            "action_title": action["action_title"],
            "permission_key": action["permission_key"],
            "button_color": action["button_color"],
            "button_icon": action["button_icon"],
            "sort_order": action["sort_order"],
            "seed_by": SEED_BY,
        }

        if action_id is None:
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
                action_values,
            ).scalar_one()
        else:
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
                    **action_values,
                    "action_id": action_id,
                },
            )

        permission_id = permission_ids[action["permission_key"]]

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
                update menu_action_permissions
                set is_active = true,
                    updated_by = :seed_by,
                    updated_at = now()
                where menu_action_id = :action_id
                  and permission_id = :permission_id
                """
            ),
            {
                "action_id": action_id,
                "permission_id": permission_id,
                "seed_by": SEED_BY,
            },
        )

    for permission_key in PERMISSION_KEYS:
        permission_id = permission_ids[permission_key]

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
                    :role_id,
                    :permission_id,
                    true,
                    :seed_by,
                    :seed_by,
                    now(),
                    now()
                where not exists (
                    select 1
                    from role_permissions
                    where role_id = :role_id
                      and permission_id = :permission_id
                )
                """
            ),
            {
                "role_id": super_admin_role_id,
                "permission_id": permission_id,
                "seed_by": SEED_BY,
            },
        )

        bind.execute(
            sa.text(
                """
                update role_permissions
                set is_active = true,
                    updated_by = :seed_by,
                    updated_at = now()
                where role_id = :role_id
                  and permission_id = :permission_id
                """
            ),
            {
                "role_id": super_admin_role_id,
                "permission_id": permission_id,
                "seed_by": SEED_BY,
            },
        )


def downgrade() -> None:
    """Remove action mappings created by this revision."""

    bind = op.get_bind()

    menu_id = bind.execute(
        sa.text(
            """
            select id
            from menus
            where menu_key = :module_key
            order by id
            limit 1
            """
        ),
        {"module_key": MODULE_KEY},
    ).scalar_one_or_none()

    if menu_id is not None:
        bind.execute(
            sa.text(
                """
                delete from menu_action_permissions
                where menu_action_id in (
                    select id
                    from menu_actions
                    where menu_id = :menu_id
                      and action_key in ('view', 'update')
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
                  and action_key in ('view', 'update')
                  and (
                      created_by = :seed_by
                      or updated_by = :seed_by
                  )
                """
            ),
            {
                "menu_id": menu_id,
                "seed_by": SEED_BY,
            },
        )

    bind.execute(
        sa.text(
            """
            delete from role_permissions
            where created_by = :seed_by
              and permission_id in (
                  select id
                  from permissions
                  where permission_key in (
                      'menu.audit_accept_proce.view',
                      'api.audit_accept_proce.view',
                      'api.audit_accept_proce.update'
                  )
              )
            """
        ),
        {"seed_by": SEED_BY},
    )