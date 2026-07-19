"""Assign Exit Meeting lock permission to applicable roles.

Revision ID: c262exitlockfix
Revises: c261exitrbac
Create Date: 2026-07-14
"""

from __future__ import annotations

from typing import Any

from alembic import op
import sqlalchemy as sa


revision = "c262exitlockfix"
down_revision = "c261exitrbac"
branch_labels = None
depends_on = None


CREATED_BY = (
    "c262exitlockfix_"
    "assign_exit_lock_permission"
)

UPDATE_PERMISSION_KEY = (
    "button.exit_meeting_minutes.update"
)

LOCK_PERMISSION_KEY = (
    "button.exit_meeting_minutes.lock"
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


def _permission_id(
    bind: Any,
    permission_key: str,
) -> Any:
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
        raise RuntimeError(
            "Permission was not found: "
            f"{permission_key}"
        )

    return row[
        _primary_key_name(permissions)
    ]


def _mapping_exists(
    bind: Any,
    table: sa.Table,
    role_id: Any,
    permission_id: Any,
) -> bool:
    result = bind.execute(
        sa.select(table).where(
            table.c.role_id == role_id,
            table.c.permission_id
            == permission_id,
        )
    ).first()

    return result is not None


def _assign_lock_permission(
    bind: Any,
) -> None:
    role_permissions = _table(
        bind,
        "role_permissions",
    )

    required_columns = {
        "role_id",
        "permission_id",
    }

    missing_columns = (
        required_columns
        - set(role_permissions.c.keys())
    )

    if missing_columns:
        raise RuntimeError(
            "role_permissions is missing "
            f"columns: {sorted(missing_columns)}"
        )

    update_permission_id = _permission_id(
        bind,
        UPDATE_PERMISSION_KEY,
    )

    lock_permission_id = _permission_id(
        bind,
        LOCK_PERMISSION_KEY,
    )

    source_rows = bind.execute(
        sa.select(role_permissions).where(
            role_permissions.c.permission_id
            == update_permission_id
        )
    ).mappings().all()

    if not source_rows:
        raise RuntimeError(
            "No role has the Exit Meeting "
            "update permission. Lock permission "
            "could not be assigned."
        )

    primary_key_name = _primary_key_name(
        role_permissions
    )

    for source_row in source_rows:
        role_id = source_row["role_id"]

        if _mapping_exists(
            bind,
            role_permissions,
            role_id,
            lock_permission_id,
        ):
            continue

        values: dict[str, Any] = {}

        for column in role_permissions.columns:
            column_name = column.name

            if column_name == primary_key_name:
                continue

            if column_name not in source_row:
                continue

            values[column_name] = (
                source_row[column_name]
            )

        values["role_id"] = role_id
        values["permission_id"] = (
            lock_permission_id
        )

        if "is_active" in role_permissions.c:
            values["is_active"] = True

        if "created_by" in role_permissions.c:
            values["created_by"] = CREATED_BY

        if "updated_by" in role_permissions.c:
            values["updated_by"] = CREATED_BY

        if "created_at" in role_permissions.c:
            values["created_at"] = (
                sa.func.now()
            )

        if "updated_at" in role_permissions.c:
            values["updated_at"] = (
                sa.func.now()
            )

        bind.execute(
            sa.insert(role_permissions)
            .values(**values)
        )


def _fix_lock_action_order(
    bind: Any,
) -> None:
    menu_actions = _table(
        bind,
        "menu_actions",
    )

    if "permission_key" not in menu_actions.c:
        raise RuntimeError(
            "menu_actions.permission_key "
            "column was not found."
        )

    values: dict[str, Any] = {}

    if "sort_order" in menu_actions.c:
        values["sort_order"] = 25

    if "updated_by" in menu_actions.c:
        values["updated_by"] = CREATED_BY

    if "updated_at" in menu_actions.c:
        values["updated_at"] = (
            sa.func.now()
        )

    if not values:
        return

    bind.execute(
        sa.update(menu_actions)
        .where(
            menu_actions.c.permission_key
            == LOCK_PERMISSION_KEY
        )
        .values(**values)
    )


def upgrade() -> None:
    bind = op.get_bind()

    inspector = sa.inspect(bind)

    required_tables = (
        "permissions",
        "role_permissions",
        "menu_actions",
    )

    for table_name in required_tables:
        if not inspector.has_table(
            table_name
        ):
            raise RuntimeError(
                "Required table was not found: "
                f"{table_name}"
            )

    _assign_lock_permission(bind)
    _fix_lock_action_order(bind)


def downgrade() -> None:
    bind = op.get_bind()

    inspector = sa.inspect(bind)

    if inspector.has_table(
        "role_permissions"
    ) and inspector.has_table(
        "permissions"
    ):
        role_permissions = _table(
            bind,
            "role_permissions",
        )

        lock_permission_id = _permission_id(
            bind,
            LOCK_PERMISSION_KEY,
        )

        conditions = [
            role_permissions.c.permission_id
            == lock_permission_id
        ]

        if "created_by" in role_permissions.c:
            conditions.append(
                role_permissions.c.created_by
                == CREATED_BY
            )

        bind.execute(
            sa.delete(role_permissions).where(
                *conditions
            )
        )

    if inspector.has_table(
        "menu_actions"
    ):
        menu_actions = _table(
            bind,
            "menu_actions",
        )

        values: dict[str, Any] = {}

        if "sort_order" in menu_actions.c:
            values["sort_order"] = 20

        if "updated_by" in menu_actions.c:
            values["updated_by"] = CREATED_BY

        if "updated_at" in menu_actions.c:
            values["updated_at"] = (
                sa.func.now()
            )

        if values:
            bind.execute(
                sa.update(menu_actions)
                .where(
                    menu_actions.c.permission_key
                    == LOCK_PERMISSION_KEY
                )
                .values(**values)
            )
