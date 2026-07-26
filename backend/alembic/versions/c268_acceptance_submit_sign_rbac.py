"""add acceptance submit and sign permissions

Revision ID: c268acceptworkflow
Revises: c267acceptemployee
Create Date: 2026-07-24
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "c268acceptworkflow"
down_revision: str | None = "c267acceptemployee"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


MODULE_KEY = "audit_accept_proce"
SEED_BY = "migration:c268acceptworkflow"

SUBMIT_PERMISSION = "button.audit_accept_proce.submit"
SIGN_PERMISSION = "button.audit_accept_proce.sign"

PERMISSIONS = (
    {
        "permission_key": SUBMIT_PERMISSION,
        "resource_type": "button",
        "resource_key": MODULE_KEY,
        "action": "submit",
        "description": (
            "Submit Audit Acceptance Procedures "
            "for partner sign-off."
        ),
    },
    {
        "permission_key": SIGN_PERMISSION,
        "resource_type": "button",
        "resource_key": MODULE_KEY,
        "action": "sign",
        "description": (
            "Sign Audit Acceptance Procedures "
            "as an authorized employee."
        ),
    },
)

ACTIONS = (
    {
        "action_key": "submit",
        "action_title": "Submit",
        "permission_key": SUBMIT_PERMISSION,
        "button_color": "amber",
        "button_icon": "Send",
        "sort_order": 30,
    },
    {
        "action_key": "sign",
        "action_title": "Sign",
        "permission_key": SIGN_PERMISSION,
        "button_color": "violet",
        "button_icon": "PenLine",
        "sort_order": 40,
    },
)


def upgrade() -> None:
    """Seed submit/sign actions and Super Admin access."""

    bind = op.get_bind()

    menu_id = bind.execute(
        sa.text(
            """
            select id
            from menus
            where menu_key = :module_key
               or route_path =
                  '/audit-planning/audit-accept-proce'
            order by id
            limit 1
            """
        ),
        {"module_key": MODULE_KEY},
    ).scalar_one_or_none()

    if menu_id is None:
        raise RuntimeError(
            "Acceptance Procedures menu was not found."
        )

    super_admin_role_id = bind.execute(
        sa.text(
            """
            select id
            from roles
            where lower(trim(role_name)) =
                  lower('Super Admin')
            order by id
            limit 1
            """
        )
    ).scalar_one_or_none()

    if super_admin_role_id is None:
        raise RuntimeError(
            "Super Admin role was not found."
        )

    for permission in PERMISSIONS:
        bind.execute(
            sa.text(
                """
                insert into permissions (
                    permission_key,
                    resource_type,
                    resource_key,
                    action,
                    description,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                values (
                    :permission_key,
                    :resource_type,
                    :resource_key,
                    :action,
                    :description,
                    true,
                    :seed_by,
                    :seed_by,
                    now(),
                    now()
                )
                on conflict (permission_key)
                do update set
                    resource_type =
                        excluded.resource_type,
                    resource_key =
                        excluded.resource_key,
                    action = excluded.action,
                    description =
                        excluded.description,
                    is_active = true,
                    updated_by = excluded.updated_by,
                    updated_at = now()
                """
            ),
            {
                **permission,
                "seed_by": SEED_BY,
            },
        )

    permission_rows = bind.execute(
        sa.text(
            """
            select id, permission_key
            from permissions
            where permission_key in (
                :submit_permission,
                :sign_permission
            )
            """
        ),
        {
            "submit_permission": SUBMIT_PERMISSION,
            "sign_permission": SIGN_PERMISSION,
        },
    ).mappings().all()

    permission_ids = {
        row["permission_key"]: row["id"]
        for row in permission_rows
    }

    expected_permissions = {
        SUBMIT_PERMISSION,
        SIGN_PERMISSION,
    }

    missing_permissions = (
        expected_permissions
        - set(permission_ids)
    )

    if missing_permissions:
        raise RuntimeError(
            "Missing Acceptance workflow permissions: "
            + ", ".join(sorted(missing_permissions))
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
            "permission_key": (
                action["permission_key"]
            ),
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
                        permission_key =
                            :permission_key,
                        button_color =
                            :button_color,
                        button_icon =
                            :button_icon,
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

        permission_id = permission_ids[
            action["permission_key"]
        ]

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
                    where menu_action_id =
                          :action_id
                      and permission_id =
                          :permission_id
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

    for permission_key in (
        SUBMIT_PERMISSION,
        SIGN_PERMISSION,
    ):
        permission_id = permission_ids[
            permission_key
        ]

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
                      and permission_id =
                          :permission_id
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
                  and permission_id =
                      :permission_id
                """
            ),
            {
                "role_id": super_admin_role_id,
                "permission_id": permission_id,
                "seed_by": SEED_BY,
            },
        )


def downgrade() -> None:
    """Remove RBAC rows created by this revision."""

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
                where created_by = :seed_by
                  and menu_action_id in (
                      select id
                      from menu_actions
                      where menu_id = :menu_id
                        and action_key in (
                            'submit',
                            'sign'
                        )
                  )
                """
            ),
            {
                "seed_by": SEED_BY,
                "menu_id": menu_id,
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
                      :submit_permission,
                      :sign_permission
                  )
              )
            """
        ),
        {
            "seed_by": SEED_BY,
            "submit_permission": SUBMIT_PERMISSION,
            "sign_permission": SIGN_PERMISSION,
        },
    )

    if menu_id is not None:
        bind.execute(
            sa.text(
                """
                delete from menu_actions
                where menu_id = :menu_id
                  and action_key in (
                      'submit',
                      'sign'
                  )
                  and created_by = :seed_by
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
            delete from permissions
            where permission_key in (
                :submit_permission,
                :sign_permission
            )
              and created_by = :seed_by
            """
        ),
        {
            "submit_permission": SUBMIT_PERMISSION,
            "sign_permission": SIGN_PERMISSION,
            "seed_by": SEED_BY,
        },
    )
