"""Add Exit Meeting Maker-Checker RBAC and approval menu.

Revision ID: c264exitworkflowrbac
Revises: c263exitworkflow
Create Date: 2026-07-14
"""

from __future__ import annotations

from typing import Any, Iterable

from alembic import op
import sqlalchemy as sa


revision = "c264exitworkflowrbac"
down_revision = "c263exitworkflow"
branch_labels = None
depends_on = None


CREATED_BY = (
    "c264exitworkflowrbac_"
    "exit_meeting_workflow_rbac"
)

MAIN_MENU_KEY = (
    "exit_meeting_minutes"
)

APPROVAL_MENU_KEY = (
    "exit_meeting_minute_approvals"
)

APPROVAL_MENU_PERMISSION = (
    "menu.exit_meeting_minute_approvals.view"
)

UPDATE_PERMISSION = (
    "button.exit_meeting_minutes.update"
)

LEGACY_LOCK_PERMISSION = (
    "button.exit_meeting_minutes.lock"
)

WORKFLOW_PERMISSIONS = (
    (
        "button.exit_meeting_minutes.submit",
        "Submit Exit Meeting Minutes",
        (
            "Submit Exit Meeting Minutes for "
            "initial lock or relock approval."
        ),
        UPDATE_PERMISSION,
    ),
    (
        "button.exit_meeting_minutes.request_unlock",
        "Request Exit Meeting Unlock",
        (
            "Request approved Exit Meeting Minutes "
            "to be unlocked for controlled editing."
        ),
        UPDATE_PERMISSION,
    ),
    (
        "button.exit_meeting_minutes.cancel_unlock",
        "Cancel Exit Meeting Unlock Request",
        (
            "Cancel the current user's pending "
            "Exit Meeting unlock request."
        ),
        UPDATE_PERMISSION,
    ),
    (
        "button.exit_meeting_minutes.approve",
        "Approve Exit Meeting Lock",
        (
            "Approve or request changes for Exit "
            "Meeting lock and relock submissions."
        ),
        LEGACY_LOCK_PERMISSION,
    ),
    (
        "button.exit_meeting_minutes.review_unlock",
        "Review Exit Meeting Unlock Request",
        (
            "Approve or reject Exit Meeting "
            "unlock requests."
        ),
        LEGACY_LOCK_PERMISSION,
    ),
)

MAIN_MENU_ACTIONS = (
    (
        "submit",
        "Submit for Approval",
        "button.exit_meeting_minutes.submit",
        "blue",
        "Send",
        25,
    ),
    (
        "request_unlock",
        "Request Unlock",
        (
            "button.exit_meeting_minutes."
            "request_unlock"
        ),
        "amber",
        "KeyRound",
        30,
    ),
    (
        "cancel_unlock",
        "Cancel Unlock Request",
        (
            "button.exit_meeting_minutes."
            "cancel_unlock"
        ),
        "slate",
        "XCircle",
        35,
    ),
)

APPROVAL_MENU_ACTIONS = (
    (
        "approve",
        "Approve Lock or Relock",
        "button.exit_meeting_minutes.approve",
        "green",
        "ShieldCheck",
        10,
    ),
    (
        "review_unlock",
        "Review Unlock Request",
        (
            "button.exit_meeting_minutes."
            "review_unlock"
        ),
        "amber",
        "KeyRound",
        20,
    ),
)


def _table(
    bind: Any,
    table_name: str,
) -> sa.Table:
    metadata = sa.MetaData()

    return sa.Table(
        table_name,
        metadata,
        autoload_with=bind,
    )


def _primary_key_name(
    table: sa.Table,
) -> str:
    columns = [
        column.name
        for column in table.primary_key.columns
    ]

    if not columns:
        raise RuntimeError(
            f"{table.name} has no primary key."
        )

    return columns[0]


def _column_name(
    table: sa.Table,
    candidates: Iterable[str],
    required: bool = False,
) -> str | None:
    for candidate in candidates:
        if candidate in table.c:
            return candidate

    if required:
        raise RuntimeError(
            f"{table.name} is missing one of "
            f"these columns: {list(candidates)}"
        )

    return None


def _row_values(
    table: sa.Table,
    row: Any,
) -> dict[str, Any]:
    primary_key_name = _primary_key_name(
        table
    )

    values: dict[str, Any] = {}

    for column in table.columns:
        column_name = column.name

        if column_name == primary_key_name:
            continue

        if column_name in row:
            values[column_name] = (
                row[column_name]
            )

    return values


def _apply_audit_values(
    table: sa.Table,
    values: dict[str, Any],
) -> None:
    if "is_active" in table.c:
        values["is_active"] = True

    if "created_by" in table.c:
        values["created_by"] = CREATED_BY

    if "updated_by" in table.c:
        values["updated_by"] = CREATED_BY

    if "created_at" in table.c:
        values["created_at"] = sa.func.now()

    if "updated_at" in table.c:
        values["updated_at"] = sa.func.now()


def _find_by_value(
    bind: Any,
    table: sa.Table,
    column_name: str,
    value: Any,
) -> Any:
    return bind.execute(
        sa.select(table).where(
            table.c[column_name] == value
        )
    ).mappings().first()


def _insert_and_get_id(
    bind: Any,
    table: sa.Table,
    values: dict[str, Any],
) -> Any:
    primary_key_name = _primary_key_name(
        table
    )

    result = bind.execute(
        sa.insert(table)
        .values(**values)
        .returning(
            table.c[primary_key_name]
        )
    )

    return result.scalar_one()


def _permission_id(
    bind: Any,
    permission_key: str,
) -> Any:
    permissions = _table(
        bind,
        "permissions",
    )

    row = _find_by_value(
        bind,
        permissions,
        "permission_key",
        permission_key,
    )

    if not row:
        raise RuntimeError(
            "Permission was not found: "
            f"{permission_key}"
        )

    return row[
        _primary_key_name(permissions)
    ]


def _menu_id(
    bind: Any,
    menu_key: str,
) -> Any:
    menus = _table(
        bind,
        "menus",
    )

    row = _find_by_value(
        bind,
        menus,
        "menu_key",
        menu_key,
    )

    if not row:
        raise RuntimeError(
            "Menu was not found: "
            f"{menu_key}"
        )

    return row[
        _primary_key_name(menus)
    ]


def _upsert_permission(
    bind: Any,
    permission_key: str,
    display_name: str,
    description: str,
    source_permission_key: str,
) -> Any:
    permissions = _table(
        bind,
        "permissions",
    )

    key_parts = permission_key.split(".")

    if len(key_parts) != 3:
        raise RuntimeError(
            "Invalid permission key format: "
            f"{permission_key}"
        )

    resource_type = key_parts[0]
    resource_key = key_parts[1]
    action = key_parts[2]

    existing = _find_by_value(
        bind,
        permissions,
        "permission_key",
        permission_key,
    )

    if existing:
        permission_id = existing[
            _primary_key_name(permissions)
        ]

        update_values: dict[str, Any] = {}

        if "resource_type" in permissions.c:
            update_values["resource_type"] = (
                resource_type
            )

        if "resource_key" in permissions.c:
            update_values["resource_key"] = (
                resource_key
            )

        if "action" in permissions.c:
            update_values["action"] = action

        if "description" in permissions.c:
            update_values["description"] = (
                description
            )

        if "is_active" in permissions.c:
            update_values["is_active"] = True

        if "updated_by" in permissions.c:
            update_values["updated_by"] = (
                CREATED_BY
            )

        if "updated_at" in permissions.c:
            update_values["updated_at"] = (
                sa.func.now()
            )

        if update_values:
            bind.execute(
                sa.update(permissions)
                .where(
                    permissions.c[
                        _primary_key_name(
                            permissions
                        )
                    ]
                    == permission_id
                )
                .values(**update_values)
            )

        return permission_id

    source = _find_by_value(
        bind,
        permissions,
        "permission_key",
        source_permission_key,
    )

    if not source:
        raise RuntimeError(
            "Source permission was not found: "
            f"{source_permission_key}"
        )

    values = _row_values(
        permissions,
        source,
    )

    values["permission_key"] = (
        permission_key
    )

    if "resource_type" in permissions.c:
        values["resource_type"] = (
            resource_type
        )

    if "resource_key" in permissions.c:
        values["resource_key"] = (
            resource_key
        )

    if "action" in permissions.c:
        values["action"] = action

    if "description" in permissions.c:
        values["description"] = description

    _apply_audit_values(
        permissions,
        values,
    )

    return _insert_and_get_id(
        bind,
        permissions,
        values,
    )


def _upsert_approval_menu(
    bind: Any,
) -> Any:
    menus = _table(
        bind,
        "menus",
    )

    existing = _find_by_value(
        bind,
        menus,
        "menu_key",
        APPROVAL_MENU_KEY,
    )

    if existing:
        menu_id = existing[
            _primary_key_name(menus)
        ]

        update_values: dict[str, Any] = {
            "menu_title": (
                "Exit Meeting Approvals"
            ),
            "route_path": (
                "/audit-meetings/minutes/"
                "exit/approvals"
            ),
            "permission_key": (
                APPROVAL_MENU_PERMISSION
            ),
            "icon": "ShieldCheck",
            "is_expandable": False,
            "is_visible": True,
            "is_active": True,
        }

        if "updated_by" in menus.c:
            update_values["updated_by"] = (
                CREATED_BY
            )

        if "updated_at" in menus.c:
            update_values["updated_at"] = (
                sa.func.now()
            )

        bind.execute(
            sa.update(menus)
            .where(
                menus.c[
                    _primary_key_name(menus)
                ]
                == menu_id
            )
            .values(**update_values)
        )

        return menu_id

    source = _find_by_value(
        bind,
        menus,
        "menu_key",
        MAIN_MENU_KEY,
    )

    if not source:
        raise RuntimeError(
            "Main Exit Meeting menu was not found."
        )

    values = _row_values(
        menus,
        source,
    )

    values.update(
        {
            "menu_key": (
                APPROVAL_MENU_KEY
            ),
            "menu_title": (
                "Exit Meeting Approvals"
            ),
            "route_path": (
                "/audit-meetings/minutes/"
                "exit/approvals"
            ),
            "icon": "ShieldCheck",
            "permission_key": (
                APPROVAL_MENU_PERMISSION
            ),
            "sort_order": (
                int(
                    source.get(
                        "sort_order"
                    )
                    or 0
                )
                + 1
            ),
            "is_expandable": False,
            "is_visible": True,
        }
    )

    _apply_audit_values(
        menus,
        values,
    )

    return _insert_and_get_id(
        bind,
        menus,
        values,
    )


def _mapping_exists(
    bind: Any,
    table: sa.Table,
    conditions: list[Any],
) -> bool:
    result = bind.execute(
        sa.select(table).where(
            *conditions
        )
    ).first()

    return result is not None


def _ensure_menu_permission(
    bind: Any,
    menu_id: Any,
    permission_id: Any,
) -> None:
    table = _table(
        bind,
        "menu_permissions",
    )

    menu_column = _column_name(
        table,
        (
            "menu_id",
        ),
        required=True,
    )

    permission_column = _column_name(
        table,
        (
            "permission_id",
        ),
        required=True,
    )

    conditions = [
        table.c[menu_column] == menu_id,
        (
            table.c[permission_column]
            == permission_id
        ),
    ]

    if _mapping_exists(
        bind,
        table,
        conditions,
    ):
        return

    values = {
        menu_column: menu_id,
        permission_column: permission_id,
    }

    _apply_audit_values(
        table,
        values,
    )

    bind.execute(
        sa.insert(table).values(**values)
    )


def _source_action_row(
    bind: Any,
    menu_id: Any,
) -> Any:
    actions = _table(
        bind,
        "menu_actions",
    )

    result = bind.execute(
        sa.select(actions).where(
            actions.c.menu_id == menu_id,
            actions.c.action_key.in_(
                ["update", "lock"]
            ),
        ).order_by(
            sa.case(
                (
                    actions.c.action_key
                    == "update",
                    0,
                ),
                else_=1,
            )
        )
    ).mappings().first()

    if not result:
        raise RuntimeError(
            "A source Exit Meeting menu action "
            "was not found."
        )

    return result


def _upsert_action(
    bind: Any,
    menu_id: Any,
    action_key: str,
    action_title: str,
    permission_key: str,
    button_color: str,
    button_icon: str,
    sort_order: int,
) -> Any:
    actions = _table(
        bind,
        "menu_actions",
    )

    existing = bind.execute(
        sa.select(actions).where(
            actions.c.menu_id == menu_id,
            actions.c.action_key
            == action_key,
        )
    ).mappings().first()

    if existing:
        action_id = existing[
            _primary_key_name(actions)
        ]

        values: dict[str, Any] = {
            "permission_key": permission_key,
        }

        if "action_title" in actions.c:
            values["action_title"] = (
                action_title
            )

        if "title" in actions.c:
            values["title"] = action_title

        if "action_name" in actions.c:
            values["action_name"] = (
                action_title
            )

        if "button_color" in actions.c:
            values["button_color"] = (
                button_color
            )

        if "button_icon" in actions.c:
            values["button_icon"] = (
                button_icon
            )

        if "sort_order" in actions.c:
            values["sort_order"] = (
                sort_order
            )

        if "is_active" in actions.c:
            values["is_active"] = True

        if "updated_by" in actions.c:
            values["updated_by"] = (
                CREATED_BY
            )

        if "updated_at" in actions.c:
            values["updated_at"] = (
                sa.func.now()
            )

        bind.execute(
            sa.update(actions)
            .where(
                actions.c[
                    _primary_key_name(actions)
                ]
                == action_id
            )
            .values(**values)
        )

        return action_id

    source = _source_action_row(
        bind,
        _menu_id(
            bind,
            MAIN_MENU_KEY,
        ),
    )

    values = _row_values(
        actions,
        source,
    )

    values["menu_id"] = menu_id
    values["action_key"] = action_key
    values["permission_key"] = (
        permission_key
    )

    if "action_title" in actions.c:
        values["action_title"] = action_title

    if "title" in actions.c:
        values["title"] = action_title

    if "action_name" in actions.c:
        values["action_name"] = action_title

    if "button_color" in actions.c:
        values["button_color"] = (
            button_color
        )

    if "button_icon" in actions.c:
        values["button_icon"] = (
            button_icon
        )

    if "sort_order" in actions.c:
        values["sort_order"] = sort_order

    _apply_audit_values(
        actions,
        values,
    )

    return _insert_and_get_id(
        bind,
        actions,
        values,
    )


def _ensure_action_permission(
    bind: Any,
    action_id: Any,
    permission_id: Any,
) -> None:
    table = _table(
        bind,
        "menu_action_permissions",
    )

    action_column = _column_name(
        table,
        (
            "menu_action_id",
            "action_id",
        ),
        required=True,
    )

    permission_column = _column_name(
        table,
        (
            "permission_id",
        ),
        required=True,
    )

    conditions = [
        table.c[action_column] == action_id,
        (
            table.c[permission_column]
            == permission_id
        ),
    ]

    if _mapping_exists(
        bind,
        table,
        conditions,
    ):
        return

    values = {
        action_column: action_id,
        permission_column: permission_id,
    }

    _apply_audit_values(
        table,
        values,
    )

    bind.execute(
        sa.insert(table).values(**values)
    )


def _assign_permission_to_source_roles(
    bind: Any,
    target_permission_key: str,
    source_permission_key: str,
) -> None:
    role_permissions = _table(
        bind,
        "role_permissions",
    )

    source_permission_id = _permission_id(
        bind,
        source_permission_key,
    )

    target_permission_id = _permission_id(
        bind,
        target_permission_key,
    )

    filters = [
        role_permissions.c.permission_id
        == source_permission_id
    ]

    if "is_active" in role_permissions.c:
        filters.append(
            role_permissions.c.is_active
            .is_(True)
        )

    source_rows = bind.execute(
        sa.select(role_permissions).where(
            *filters
        )
    ).mappings().all()

    if not source_rows:
        raise RuntimeError(
            "No active role assignment was "
            "found for source permission: "
            f"{source_permission_key}"
        )

    primary_key_name = _primary_key_name(
        role_permissions
    )

    for source_row in source_rows:
        role_id = source_row["role_id"]

        exists = bind.execute(
            sa.select(role_permissions).where(
                role_permissions.c.role_id
                == role_id,
                role_permissions.c.permission_id
                == target_permission_id,
            )
        ).first()

        if exists:
            continue

        values: dict[str, Any] = {}

        for column in role_permissions.columns:
            column_name = column.name

            if column_name == primary_key_name:
                continue

            if column_name in source_row:
                values[column_name] = (
                    source_row[column_name]
                )

        values["role_id"] = role_id
        values["permission_id"] = (
            target_permission_id
        )

        _apply_audit_values(
            role_permissions,
            values,
        )

        bind.execute(
            sa.insert(role_permissions)
            .values(**values)
        )


def _deactivate_legacy_lock_action(
    bind: Any,
) -> None:
    actions = _table(
        bind,
        "menu_actions",
    )

    main_menu_id = _menu_id(
        bind,
        MAIN_MENU_KEY,
    )

    values: dict[str, Any] = {}

    if "is_active" in actions.c:
        values["is_active"] = False

    if "is_visible" in actions.c:
        values["is_visible"] = False

    if "updated_by" in actions.c:
        values["updated_by"] = CREATED_BY

    if "updated_at" in actions.c:
        values["updated_at"] = sa.func.now()

    if not values:
        return

    bind.execute(
        sa.update(actions)
        .where(
            actions.c.menu_id
            == main_menu_id,
            actions.c.action_key
            == "lock",
        )
        .values(**values)
    )


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    required_tables = (
        "menus",
        "menu_actions",
        "permissions",
        "menu_permissions",
        "menu_action_permissions",
        "role_permissions",
    )

    for table_name in required_tables:
        if not inspector.has_table(
            table_name
        ):
            raise RuntimeError(
                "Required RBAC table was not found: "
                f"{table_name}"
            )

    approval_view_permission_id = (
        _upsert_permission(
            bind=bind,
            permission_key=(
                APPROVAL_MENU_PERMISSION
            ),
            display_name=(
                "View Exit Meeting Approvals"
            ),
            description=(
                "View the Exit Meeting Maker-"
                "Checker approval queues."
            ),
            source_permission_key=(
                "menu.exit_meeting_minutes.view"
            ),
        )
    )

    for (
        permission_key,
        display_name,
        description,
        source_permission_key,
    ) in WORKFLOW_PERMISSIONS:
        _upsert_permission(
            bind=bind,
            permission_key=permission_key,
            display_name=display_name,
            description=description,
            source_permission_key=(
                source_permission_key
            ),
        )

    approval_menu_id = (
        _upsert_approval_menu(bind)
    )

    _ensure_menu_permission(
        bind=bind,
        menu_id=approval_menu_id,
        permission_id=(
            approval_view_permission_id
        ),
    )

    main_menu_id = _menu_id(
        bind,
        MAIN_MENU_KEY,
    )

    for (
        action_key,
        action_title,
        permission_key,
        button_color,
        button_icon,
        sort_order,
    ) in MAIN_MENU_ACTIONS:
        action_id = _upsert_action(
            bind=bind,
            menu_id=main_menu_id,
            action_key=action_key,
            action_title=action_title,
            permission_key=permission_key,
            button_color=button_color,
            button_icon=button_icon,
            sort_order=sort_order,
        )

        _ensure_action_permission(
            bind=bind,
            action_id=action_id,
            permission_id=_permission_id(
                bind,
                permission_key,
            ),
        )

    for (
        action_key,
        action_title,
        permission_key,
        button_color,
        button_icon,
        sort_order,
    ) in APPROVAL_MENU_ACTIONS:
        action_id = _upsert_action(
            bind=bind,
            menu_id=approval_menu_id,
            action_key=action_key,
            action_title=action_title,
            permission_key=permission_key,
            button_color=button_color,
            button_icon=button_icon,
            sort_order=sort_order,
        )

        _ensure_action_permission(
            bind=bind,
            action_id=action_id,
            permission_id=_permission_id(
                bind,
                permission_key,
            ),
        )

    _deactivate_legacy_lock_action(bind)

    # Maker permissions follow users who can update
    # Exit Meeting Minutes.
    for permission_key in (
        "button.exit_meeting_minutes.submit",
        (
            "button.exit_meeting_minutes."
            "request_unlock"
        ),
        (
            "button.exit_meeting_minutes."
            "cancel_unlock"
        ),
    ):
        _assign_permission_to_source_roles(
            bind=bind,
            target_permission_key=(
                permission_key
            ),
            source_permission_key=(
                UPDATE_PERMISSION
            ),
        )

    # Checker permissions and approval-menu access
    # follow the previous controlled Lock role set.
    for permission_key in (
        APPROVAL_MENU_PERMISSION,
        "button.exit_meeting_minutes.approve",
        (
            "button.exit_meeting_minutes."
            "review_unlock"
        ),
    ):
        _assign_permission_to_source_roles(
            bind=bind,
            target_permission_key=(
                permission_key
            ),
            source_permission_key=(
                LEGACY_LOCK_PERMISSION
            ),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    new_permission_keys = [
        APPROVAL_MENU_PERMISSION,
        *[
            item[0]
            for item in WORKFLOW_PERMISSIONS
        ],
    ]

    if inspector.has_table(
        "role_permissions"
    ) and inspector.has_table(
        "permissions"
    ):
        role_permissions = _table(
            bind,
            "role_permissions",
        )

        permissions = _table(
            bind,
            "permissions",
        )

        permission_ids = bind.execute(
            sa.select(
                permissions.c[
                    _primary_key_name(
                        permissions
                    )
                ]
            ).where(
                permissions.c.permission_key
                .in_(new_permission_keys)
            )
        ).scalars().all()

        if permission_ids:
            bind.execute(
                sa.delete(role_permissions).where(
                    role_permissions.c.permission_id
                    .in_(permission_ids)
                )
            )

    if inspector.has_table(
        "menu_action_permissions"
    ) and inspector.has_table(
        "menu_actions"
    ):
        actions = _table(
            bind,
            "menu_actions",
        )

        action_permissions = _table(
            bind,
            "menu_action_permissions",
        )

        action_id_column = _column_name(
            action_permissions,
            (
                "menu_action_id",
                "action_id",
            ),
            required=True,
        )

        # Use a direct query because the action
        # permission keys are known.
        action_ids = bind.execute(
            sa.select(
                actions.c[
                    _primary_key_name(actions)
                ]
            ).where(
                actions.c.permission_key.in_(
                    [
                        action[2]
                        for action in (
                            MAIN_MENU_ACTIONS
                            + APPROVAL_MENU_ACTIONS
                        )
                    ]
                )
            )
        ).scalars().all()

        if action_ids:
            bind.execute(
                sa.delete(
                    action_permissions
                ).where(
                    action_permissions.c[
                        action_id_column
                    ].in_(action_ids)
                )
            )

    if inspector.has_table(
        "menu_permissions"
    ) and inspector.has_table(
        "menus"
    ):
        menus = _table(
            bind,
            "menus",
        )

        menu_permissions = _table(
            bind,
            "menu_permissions",
        )

        approval_menu = _find_by_value(
            bind,
            menus,
            "menu_key",
            APPROVAL_MENU_KEY,
        )

        if approval_menu:
            approval_menu_id = approval_menu[
                _primary_key_name(menus)
            ]

            bind.execute(
                sa.delete(
                    menu_permissions
                ).where(
                    menu_permissions.c.menu_id
                    == approval_menu_id
                )
            )

    if inspector.has_table(
        "menu_actions"
    ):
        actions = _table(
            bind,
            "menu_actions",
        )

        bind.execute(
            sa.delete(actions).where(
                actions.c.permission_key.in_(
                    [
                        action[2]
                        for action in (
                            MAIN_MENU_ACTIONS
                            + APPROVAL_MENU_ACTIONS
                        )
                    ]
                )
            )
        )

        main_menu_id = _menu_id(
            bind,
            MAIN_MENU_KEY,
        )

        values: dict[str, Any] = {}

        if "is_active" in actions.c:
            values["is_active"] = True

        if "updated_by" in actions.c:
            values["updated_by"] = CREATED_BY

        if "updated_at" in actions.c:
            values["updated_at"] = (
                sa.func.now()
            )

        if values:
            bind.execute(
                sa.update(actions)
                .where(
                    actions.c.menu_id
                    == main_menu_id,
                    actions.c.action_key
                    == "lock",
                )
                .values(**values)
            )

    if inspector.has_table("menus"):
        menus = _table(
            bind,
            "menus",
        )

        conditions = [
            menus.c.menu_key
            == APPROVAL_MENU_KEY
        ]

        if "created_by" in menus.c:
            conditions.append(
                menus.c.created_by
                == CREATED_BY
            )

        bind.execute(
            sa.delete(menus).where(
                *conditions
            )
        )

    if inspector.has_table("permissions"):
        permissions = _table(
            bind,
            "permissions",
        )

        conditions = [
            permissions.c.permission_key
            .in_(new_permission_keys)
        ]

        if "created_by" in permissions.c:
            conditions.append(
                permissions.c.created_by
                == CREATED_BY
            )

        bind.execute(
            sa.delete(permissions).where(
                *conditions
            )
        )
