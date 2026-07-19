"""Add Exit Meeting Minutes navigation and permissions.

Revision ID: c261exitrbac
Revises: b599332dee15
Create Date: 2026-07-14
"""

from __future__ import annotations

from typing import Any

from alembic import op
import sqlalchemy as sa


revision = "c261exitrbac"
down_revision = "b599332dee15"
branch_labels = None
depends_on = None

MODULE_KEY = "exit_meeting_minutes"
SOURCE_MODULE_KEY = "entrance_meeting_minutes"
CREATED_BY = "c261exitrbac_exit_meeting_minutes_rbac"

BUTTON_ACTIONS = (
    "view",
    "create",
    "update",
    "delete",
    "restore",
    "permanent_delete",
    "export",
    "import",
    "lock",
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


def _primary_key_name(table: sa.Table) -> str:
    primary_keys = [
        column.name
        for column in table.primary_key.columns
    ]

    if not primary_keys:
        raise RuntimeError(
            f"{table.name} has no primary key."
        )

    return primary_keys[0]


def _table_exists(
    bind: Any,
    table_name: str,
) -> bool:
    return sa.inspect(bind).has_table(table_name)


def _replace_entrance_with_exit(
    value: Any,
) -> Any:
    if not isinstance(value, str):
        return value

    replacements = (
        (
            "entrance_meeting_minutes",
            "exit_meeting_minutes",
        ),
        (
            "entrance-meeting-minutes",
            "exit-meeting-minutes",
        ),
        (
            "Entrance Meeting Minutes",
            "Exit Meeting Minutes",
        ),
        (
            "Entrance Meeting",
            "Exit Meeting",
        ),
        (
            "minutes/entrance",
            "minutes/exit",
        ),
        (
            "Minutes/Entrance",
            "Minutes/Exit",
        ),
    )

    result = value

    for old_value, new_value in replacements:
        result = result.replace(
            old_value,
            new_value,
        )

    return result


def _replace_update_with_lock(
    value: Any,
) -> Any:
    if not isinstance(value, str):
        return value

    replacements = (
        (".update", ".lock"),
        ("_update", "_lock"),
        ("-update", "-lock"),
        ("/update", "/lock"),
        ("Update", "Lock"),
        ("update", "lock"),
        ("Edit", "Lock"),
        ("edit", "lock"),
        ("Pencil", "Lock"),
        ("pencil", "lock"),
    )

    result = value

    for old_value, new_value in replacements:
        result = result.replace(
            old_value,
            new_value,
        )

    return result


def _find_row_by_text(
    bind: Any,
    table_name: str,
    search_values: tuple[str, ...],
) -> dict[str, Any] | None:
    where_parts = []
    params: dict[str, Any] = {}

    for index, search_value in enumerate(
        search_values
    ):
        parameter_name = f"search_{index}"
        params[parameter_name] = (
            f"%{search_value}%"
        )
        where_parts.append(
            "row_to_json(item)::text "
            f"ilike :{parameter_name}"
        )

    query = sa.text(
        f"""
        select *
        from {table_name} item
        where {" or ".join(where_parts)}
        order by 1
        limit 1
        """
    )

    row = bind.execute(
        query,
        params,
    ).mappings().first()

    return dict(row) if row else None


def _clone_row(
    bind: Any,
    table: sa.Table,
    source_row: dict[str, Any],
    *,
    transform_lock: bool = False,
    overrides: dict[str, Any] | None = None,
) -> Any:
    primary_key_name = _primary_key_name(table)
    values: dict[str, Any] = {}

    for column in table.columns:
        column_name = column.name

        if column_name == primary_key_name:
            continue

        if column_name not in source_row:
            continue

        value = _replace_entrance_with_exit(
            source_row[column_name]
        )

        if transform_lock:
            value = _replace_update_with_lock(
                value
            )

        values[column_name] = value

    for audit_column in (
        "created_by",
        "updated_by",
    ):
        if audit_column in table.c:
            values[audit_column] = CREATED_BY

    for timestamp_column in (
        "created_at",
        "updated_at",
    ):
        if timestamp_column in table.c:
            values[timestamp_column] = (
                sa.func.now()
            )

    if "is_active" in table.c:
        values["is_active"] = True

    if overrides:
        for key, value in overrides.items():
            if key in table.c:
                values[key] = value

    result = bind.execute(
        sa.insert(table)
        .values(**values)
        .returning(table.c[primary_key_name])
    )

    return result.scalar_one()


def _find_action_name(
    row: dict[str, Any],
) -> str | None:
    action_candidates = (
        "action",
        "action_key",
        "action_code",
        "code",
        "slug",
        "name",
    )

    valid_actions = {
        "view",
        "create",
        "update",
        "delete",
        "inactive",
        "restore",
        "permanent_delete",
        "export",
        "import",
        "lock",
    }

    for key in action_candidates:
        value = row.get(key)

        if not isinstance(value, str):
            continue

        normalized = value.strip().lower()

        if normalized in valid_actions:
            return normalized

        for action in valid_actions:
            if normalized.endswith(
                f".{action}"
            ):
                return action

            if normalized.endswith(
                f"_{action}"
            ):
                return action

            if normalized.endswith(
                f"-{action}"
            ):
                return action

    row_text = " ".join(
        str(value).lower()
        for value in row.values()
        if value is not None
    )

    for action in (
        "permanent_delete",
        "restore",
        "create",
        "update",
        "delete",
        "export",
        "import",
        "view",
        "lock",
    ):
        if action in row_text:
            return action

    return None


def _find_menu_id(
    bind: Any,
    module_key: str,
) -> Any | None:
    menu_row = _find_row_by_text(
        bind,
        "menus",
        (
            module_key,
            module_key.replace("_", "-"),
            (
                "minutes/entrance"
                if module_key
                == SOURCE_MODULE_KEY
                else "minutes/exit"
            ),
        ),
    )

    if not menu_row:
        return None

    menus = _table(bind, "menus")
    primary_key_name = _primary_key_name(menus)

    return menu_row[primary_key_name]


def _permission_id(
    bind: Any,
    permission_key: str,
) -> Any | None:
    permissions = _table(
        bind,
        "permissions",
    )

    row = bind.execute(
        sa.select(permissions).where(
            permissions.c.permission_key
            == permission_key
        )
    ).mappings().first()

    if not row:
        return None

    primary_key_name = _primary_key_name(
        permissions
    )

    return row[primary_key_name]


def _create_permission(
    bind: Any,
    permission_key: str,
    resource_type: str,
    action: str,
    description: str,
) -> Any:
    existing_id = _permission_id(
        bind,
        permission_key,
    )

    if existing_id is not None:
        return existing_id

    permissions = _table(
        bind,
        "permissions",
    )
    primary_key_name = _primary_key_name(
        permissions
    )

    values: dict[str, Any] = {
        "permission_key": permission_key,
        "resource_type": resource_type,
        "resource_key": MODULE_KEY,
        "action": action,
        "description": description,
    }

    for audit_column in (
        "created_by",
        "updated_by",
    ):
        if audit_column in permissions.c:
            values[audit_column] = CREATED_BY

    for timestamp_column in (
        "created_at",
        "updated_at",
    ):
        if timestamp_column in permissions.c:
            values[timestamp_column] = (
                sa.func.now()
            )

    if "is_active" in permissions.c:
        values["is_active"] = True

    result = bind.execute(
        sa.insert(permissions)
        .values(**values)
        .returning(
            permissions.c[primary_key_name]
        )
    )

    return result.scalar_one()


def _mapping_exists(
    bind: Any,
    table: sa.Table,
    filters: dict[str, Any],
) -> bool:
    conditions = [
        table.c[key] == value
        for key, value in filters.items()
    ]

    row = bind.execute(
        sa.select(table).where(*conditions)
    ).first()

    return row is not None


def _create_mapping(
    bind: Any,
    table_name: str,
    filters: dict[str, Any],
) -> None:
    table = _table(bind, table_name)

    if _mapping_exists(
        bind,
        table,
        filters,
    ):
        return

    values = dict(filters)

    for audit_column in (
        "created_by",
        "updated_by",
    ):
        if audit_column in table.c:
            values[audit_column] = CREATED_BY

    for timestamp_column in (
        "created_at",
        "updated_at",
    ):
        if timestamp_column in table.c:
            values[timestamp_column] = (
                sa.func.now()
            )

    if "is_active" in table.c:
        values["is_active"] = True

    bind.execute(
        sa.insert(table).values(**values)
    )


def _copy_role_permissions(
    bind: Any,
    source_permission_id: Any,
    target_permission_id: Any,
) -> None:
    if not _table_exists(
        bind,
        "role_permissions",
    ):
        return

    role_permissions = _table(
        bind,
        "role_permissions",
    )

    if (
        "permission_id" not in role_permissions.c
        or "role_id" not in role_permissions.c
    ):
        return

    source_rows = bind.execute(
        sa.select(role_permissions).where(
            role_permissions.c.permission_id
            == source_permission_id
        )
    ).mappings().all()

    for source_row in source_rows:
        role_id = source_row["role_id"]

        filters = {
            "role_id": role_id,
            "permission_id": (
                target_permission_id
            ),
        }

        if _mapping_exists(
            bind,
            role_permissions,
            filters,
        ):
            continue

        values = dict(filters)

        for column in role_permissions.columns:
            column_name = column.name

            if (
                column.primary_key
                or column_name in values
            ):
                continue

            if column_name in source_row:
                values[column_name] = (
                    source_row[column_name]
                )

        for audit_column in (
            "created_by",
            "updated_by",
        ):
            if audit_column in role_permissions.c:
                values[audit_column] = (
                    CREATED_BY
                )

        for timestamp_column in (
            "created_at",
            "updated_at",
        ):
            if timestamp_column in role_permissions.c:
                values[timestamp_column] = (
                    sa.func.now()
                )

        if "is_active" in role_permissions.c:
            values["is_active"] = True

        bind.execute(
            sa.insert(role_permissions)
            .values(**values)
        )


def _build_lock_action_overrides(
    table: sa.Table,
    source_row: dict[str, Any],
) -> dict[str, Any]:
    overrides: dict[str, Any] = {}

    action_columns = (
        "action",
        "action_key",
        "action_code",
        "code",
        "slug",
    )

    label_columns = (
        "name",
        "title",
        "label",
        "action_name",
        "display_name",
    )

    for column_name in action_columns:
        if column_name not in table.c:
            continue

        source_value = source_row.get(
            column_name
        )

        if not isinstance(source_value, str):
            continue

        overrides[column_name] = (
            _replace_update_with_lock(
                _replace_entrance_with_exit(
                    source_value
                )
            )
        )

    for column_name in label_columns:
        if column_name not in table.c:
            continue

        source_value = source_row.get(
            column_name
        )

        if isinstance(source_value, str):
            overrides[column_name] = (
                _replace_update_with_lock(
                    _replace_entrance_with_exit(
                        source_value
                    )
                )
            )

    return overrides


def upgrade() -> None:
    bind = op.get_bind()

    required_tables = (
        "menus",
        "menu_actions",
        "permissions",
        "menu_permissions",
        "menu_action_permissions",
    )

    for table_name in required_tables:
        if not _table_exists(
            bind,
            table_name,
        ):
            raise RuntimeError(
                f"Required table not found: "
                f"{table_name}"
            )

    menus = _table(bind, "menus")
    menu_actions = _table(
        bind,
        "menu_actions",
    )

    source_menu_row = _find_row_by_text(
        bind,
        "menus",
        (
            SOURCE_MODULE_KEY,
            "entrance-meeting-minutes",
            "minutes/entrance",
        ),
    )

    if not source_menu_row:
        raise RuntimeError(
            "Entrance Meeting Minutes menu "
            "record was not found."
        )

    source_menu_id = source_menu_row[
        _primary_key_name(menus)
    ]

    exit_menu_id = _find_menu_id(
        bind,
        MODULE_KEY,
    )

    if exit_menu_id is None:
        menu_overrides: dict[str, Any] = {}

        order_columns = (
            "sort_order",
            "display_order",
            "order_no",
            "sequence",
            "position",
        )

        for column_name in order_columns:
            value = source_menu_row.get(
                column_name
            )

            if isinstance(value, int):
                menu_overrides[column_name] = (
                    value + 1
                )

        exit_menu_id = _clone_row(
            bind,
            menus,
            source_menu_row,
            overrides=menu_overrides,
        )

    menu_fk_name = None

    for candidate in (
        "menu_id",
        "parent_menu_id",
    ):
        if candidate in menu_actions.c:
            menu_fk_name = candidate
            break

    if menu_fk_name is None:
        raise RuntimeError(
            "menu_actions menu foreign key "
            "column was not found."
        )

    source_action_rows = bind.execute(
        sa.select(menu_actions).where(
            menu_actions.c[menu_fk_name]
            == source_menu_id
        )
    ).mappings().all()

    if not source_action_rows:
        raise RuntimeError(
            "Entrance Meeting Minutes actions "
            "were not found."
        )

    existing_exit_rows = bind.execute(
        sa.select(menu_actions).where(
            menu_actions.c[menu_fk_name]
            == exit_menu_id
        )
    ).mappings().all()

    exit_action_ids: dict[str, Any] = {}

    for row in existing_exit_rows:
        action_name = _find_action_name(
            dict(row)
        )

        if action_name:
            exit_action_ids[action_name] = (
                row[
                    _primary_key_name(
                        menu_actions
                    )
                ]
            )

    source_actions: dict[
        str,
        dict[str, Any],
    ] = {}

    for row in source_action_rows:
        row_dict = dict(row)
        action_name = _find_action_name(
            row_dict
        )

        if action_name:
            source_actions[action_name] = (
                row_dict
            )

    for action_name, source_row in (
        source_actions.items()
    ):
        if action_name in exit_action_ids:
            continue

        action_id = _clone_row(
            bind,
            menu_actions,
            source_row,
            overrides={
                menu_fk_name: exit_menu_id,
            },
        )

        exit_action_ids[action_name] = (
            action_id
        )

    if "lock" not in exit_action_ids:
        lock_template = (
            source_actions.get("update")
            or source_actions.get("create")
        )

        if not lock_template:
            raise RuntimeError(
                "No action template was available "
                "for the Lock action."
            )

        lock_overrides = (
            _build_lock_action_overrides(
                menu_actions,
                lock_template,
            )
        )
        lock_overrides[menu_fk_name] = (
            exit_menu_id
        )

        exit_action_ids["lock"] = _clone_row(
            bind,
            menu_actions,
            lock_template,
            transform_lock=True,
            overrides=lock_overrides,
        )

    permission_ids: dict[str, Any] = {}

    permission_ids["menu_view"] = (
        _create_permission(
            bind,
            "menu.exit_meeting_minutes.view",
            "menu",
            "view",
            "View Exit Meeting Minutes menu.",
        )
    )

    description_map = {
        "view": (
            "Show view action. "
            "Exit Meeting Minutes"
        ),
        "create": (
            "Show create button. "
            "Exit Meeting Minutes"
        ),
        "update": (
            "Show update button. "
            "Exit Meeting Minutes"
        ),
        "delete": (
            "Show inactive/delete button. "
            "Exit Meeting Minutes"
        ),
        "restore": (
            "Show restore button. "
            "Exit Meeting Minutes"
        ),
        "permanent_delete": (
            "Show permanent delete button. "
            "Exit Meeting Minutes"
        ),
        "export": (
            "Show export button. "
            "Exit Meeting Minutes"
        ),
        "import": (
            "Show import button. "
            "Exit Meeting Minutes"
        ),
        "lock": (
            "Show immutable lock button. "
            "Exit Meeting Minutes"
        ),
    }

    for action_name in BUTTON_ACTIONS:
        permission_ids[action_name] = (
            _create_permission(
                bind,
                (
                    "button.exit_meeting_minutes."
                    f"{action_name}"
                ),
                "button",
                action_name,
                description_map[action_name],
            )
        )

    _create_mapping(
        bind,
        "menu_permissions",
        {
            "menu_id": exit_menu_id,
            "permission_id": (
                permission_ids["menu_view"]
            ),
        },
    )

    for action_name, action_id in (
        exit_action_ids.items()
    ):
        permission_id = permission_ids.get(
            action_name
        )

        if permission_id is None:
            continue

        _create_mapping(
            bind,
            "menu_action_permissions",
            {
                "menu_action_id": action_id,
                "permission_id": (
                    permission_id
                ),
            },
        )

    source_target_permission_keys = {
        (
            "menu.entrance_meeting_minutes."
            "view"
        ): (
            "menu.exit_meeting_minutes.view"
        ),
    }

    for action_name in BUTTON_ACTIONS:
        source_target_permission_keys[
            (
                "button.entrance_meeting_minutes."
                f"{action_name}"
            )
        ] = (
            "button.exit_meeting_minutes."
            f"{action_name}"
        )

    for (
        source_permission_key,
        target_permission_key,
    ) in source_target_permission_keys.items():
        source_permission_id = (
            _permission_id(
                bind,
                source_permission_key,
            )
        )
        target_permission_id = (
            _permission_id(
                bind,
                target_permission_key,
            )
        )

        if (
            source_permission_id is None
            or target_permission_id is None
        ):
            continue

        _copy_role_permissions(
            bind,
            source_permission_id,
            target_permission_id,
        )


def downgrade() -> None:
    bind = op.get_bind()

    if not _table_exists(
        bind,
        "permissions",
    ):
        return

    permissions = _table(
        bind,
        "permissions",
    )

    permission_keys = [
        "menu.exit_meeting_minutes.view",
        *[
            (
                "button.exit_meeting_minutes."
                f"{action_name}"
            )
            for action_name in BUTTON_ACTIONS
        ],
    ]

    permission_rows = bind.execute(
        sa.select(permissions).where(
            permissions.c.permission_key.in_(
                permission_keys
            )
        )
    ).mappings().all()

    permission_pk = _primary_key_name(
        permissions
    )
    permission_ids = [
        row[permission_pk]
        for row in permission_rows
    ]

    exit_menu_id = None
    exit_action_ids: list[Any] = []

    if _table_exists(bind, "menus"):
        exit_menu_id = _find_menu_id(
            bind,
            MODULE_KEY,
        )

    if (
        exit_menu_id is not None
        and _table_exists(
            bind,
            "menu_actions",
        )
    ):
        menu_actions = _table(
            bind,
            "menu_actions",
        )

        menu_fk_name = (
            "menu_id"
            if "menu_id" in menu_actions.c
            else "parent_menu_id"
        )

        action_rows = bind.execute(
            sa.select(menu_actions).where(
                menu_actions.c[menu_fk_name]
                == exit_menu_id
            )
        ).mappings().all()

        action_pk = _primary_key_name(
            menu_actions
        )

        exit_action_ids = [
            row[action_pk]
            for row in action_rows
        ]

    if (
        permission_ids
        and _table_exists(
            bind,
            "role_permissions",
        )
    ):
        role_permissions = _table(
            bind,
            "role_permissions",
        )

        bind.execute(
            sa.delete(role_permissions).where(
                role_permissions.c.permission_id
                .in_(permission_ids)
            )
        )

    if _table_exists(
        bind,
        "menu_action_permissions",
    ):
        mapping = _table(
            bind,
            "menu_action_permissions",
        )

        conditions = []

        if permission_ids:
            conditions.append(
                mapping.c.permission_id.in_(
                    permission_ids
                )
            )

        if exit_action_ids:
            conditions.append(
                mapping.c.menu_action_id.in_(
                    exit_action_ids
                )
            )

        if conditions:
            bind.execute(
                sa.delete(mapping).where(
                    sa.or_(*conditions)
                )
            )

    if (
        exit_menu_id is not None
        and _table_exists(
            bind,
            "menu_permissions",
        )
    ):
        menu_permissions = _table(
            bind,
            "menu_permissions",
        )

        bind.execute(
            sa.delete(menu_permissions).where(
                menu_permissions.c.menu_id
                == exit_menu_id
            )
        )

    if (
        exit_action_ids
        and _table_exists(
            bind,
            "menu_actions",
        )
    ):
        menu_actions = _table(
            bind,
            "menu_actions",
        )
        action_pk = _primary_key_name(
            menu_actions
        )

        bind.execute(
            sa.delete(menu_actions).where(
                menu_actions.c[action_pk].in_(
                    exit_action_ids
                )
            )
        )

    if (
        exit_menu_id is not None
        and _table_exists(bind, "menus")
    ):
        menus = _table(bind, "menus")
        menu_pk = _primary_key_name(menus)

        bind.execute(
            sa.delete(menus).where(
                menus.c[menu_pk]
                == exit_menu_id
            )
        )

    if permission_ids:
        bind.execute(
            sa.delete(permissions).where(
                permissions.c[permission_pk]
                .in_(permission_ids)
            )
        )
