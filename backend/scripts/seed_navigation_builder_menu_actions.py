
# E:\Audit\AMS\backend\scripts\seed_navigation_builder_menu_actions.py

import asyncio
import os
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


SEED_BY = "c23_9_navigation_builder_actions_seed"


def load_env_value(env_path: Path, key: str) -> str | None:
    if not env_path.exists():
        return None

    for raw_line in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        name, value = line.split("=", 1)
        if name.strip() == key:
            return value.strip().strip('"').strip("'")

    return None


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL") or load_env_value(Path(".env"), "DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL not found in backend/.env")
    return database_url


PERMISSIONS = [
    {
        "permission_key": "button.menu.export",
        "resource_type": "button",
        "resource_key": "menu",
        "action": "export",
        "description": "Export navigation builder records",
    },
    {
        "permission_key": "button.menu.import",
        "resource_type": "button",
        "resource_key": "menu",
        "action": "import",
        "description": "Import navigation builder records",
    },
]


MENU_ACTIONS = [
    {
        "action_key": "group_create",
        "action_title": "Add Group",
        "permission_key": "api.navigation_group.create",
        "button_color": "blue",
        "button_icon": "Plus",
        "sort_order": 10,
    },
    {
        "action_key": "group_update",
        "action_title": "Edit Group",
        "permission_key": "api.navigation_group.update",
        "button_color": "slate",
        "button_icon": "Pencil",
        "sort_order": 11,
    },
    {
        "action_key": "group_delete",
        "action_title": "Inactive Group",
        "permission_key": "api.navigation_group.delete",
        "button_color": "amber",
        "button_icon": "Trash2",
        "sort_order": 12,
    },
    {
        "action_key": "group_restore",
        "action_title": "Restore Group",
        "permission_key": "api.navigation_group.restore",
        "button_color": "emerald",
        "button_icon": "RotateCcw",
        "sort_order": 13,
    },
    {
        "action_key": "group_permanent_delete",
        "action_title": "Permanent Delete Group",
        "permission_key": "api.navigation_group.permanent_delete",
        "button_color": "rose",
        "button_icon": "AlertTriangle",
        "sort_order": 14,
    },
    {
        "action_key": "menu_create",
        "action_title": "Add Menu",
        "permission_key": "api.menu.create",
        "button_color": "blue",
        "button_icon": "Plus",
        "sort_order": 20,
    },
    {
        "action_key": "menu_update",
        "action_title": "Edit Menu",
        "permission_key": "api.menu.update",
        "button_color": "slate",
        "button_icon": "Pencil",
        "sort_order": 21,
    },
    {
        "action_key": "menu_delete",
        "action_title": "Inactive Menu",
        "permission_key": "api.menu.delete",
        "button_color": "amber",
        "button_icon": "Trash2",
        "sort_order": 22,
    },
    {
        "action_key": "menu_restore",
        "action_title": "Restore Menu",
        "permission_key": "api.menu.restore",
        "button_color": "emerald",
        "button_icon": "RotateCcw",
        "sort_order": 23,
    },
    {
        "action_key": "menu_permanent_delete",
        "action_title": "Permanent Delete Menu",
        "permission_key": "api.menu.permanent_delete",
        "button_color": "rose",
        "button_icon": "AlertTriangle",
        "sort_order": 24,
    },
    {
        "action_key": "action_create",
        "action_title": "Add Action",
        "permission_key": "api.menu_action.create",
        "button_color": "blue",
        "button_icon": "Plus",
        "sort_order": 30,
    },
    {
        "action_key": "action_update",
        "action_title": "Edit Action",
        "permission_key": "api.menu_action.update",
        "button_color": "slate",
        "button_icon": "Pencil",
        "sort_order": 31,
    },
    {
        "action_key": "action_delete",
        "action_title": "Inactive Action",
        "permission_key": "api.menu_action.delete",
        "button_color": "amber",
        "button_icon": "Trash2",
        "sort_order": 32,
    },
    {
        "action_key": "action_restore",
        "action_title": "Restore Action",
        "permission_key": "api.menu_action.restore",
        "button_color": "emerald",
        "button_icon": "RotateCcw",
        "sort_order": 33,
    },
    {
        "action_key": "action_permanent_delete",
        "action_title": "Permanent Delete Action",
        "permission_key": "api.menu_action.permanent_delete",
        "button_color": "rose",
        "button_icon": "AlertTriangle",
        "sort_order": 34,
    },
    {
        "action_key": "export",
        "action_title": "Export",
        "permission_key": "button.menu.export",
        "button_color": "sky",
        "button_icon": "Download",
        "sort_order": 90,
    },
    {
        "action_key": "import",
        "action_title": "Import",
        "permission_key": "button.menu.import",
        "button_color": "sky",
        "button_icon": "Upload",
        "sort_order": 91,
    },
]


async def ensure_permission(conn, item: dict[str, object]) -> None:
    existing = await conn.execute(
        text("SELECT id FROM permissions WHERE permission_key = :permission_key"),
        {"permission_key": item["permission_key"]},
    )
    row = existing.first()

    if row:
        await conn.execute(
            text("""
                UPDATE permissions
                SET
                    resource_type = :resource_type,
                    resource_key = :resource_key,
                    action = :action,
                    description = :description,
                    is_active = TRUE,
                    updated_by = :updated_by,
                    updated_at = NOW()
                WHERE permission_key = :permission_key
            """),
            {**item, "updated_by": SEED_BY},
        )
        return

    await conn.execute(
        text("""
            INSERT INTO permissions (
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
            VALUES (
                :permission_key,
                :resource_type,
                :resource_key,
                :action,
                :description,
                TRUE,
                :created_by,
                :updated_by,
                NOW(),
                NOW()
            )
        """),
        {**item, "created_by": SEED_BY, "updated_by": SEED_BY},
    )


async def ensure_menu_action(conn, menu_id: int, item: dict[str, object]) -> None:
    existing = await conn.execute(
        text("""
            SELECT id
            FROM menu_actions
            WHERE menu_id = :menu_id
              AND action_key = :action_key
        """),
        {"menu_id": menu_id, "action_key": item["action_key"]},
    )
    row = existing.first()

    payload = {**item, "menu_id": menu_id, "updated_by": SEED_BY}

    if row:
        await conn.execute(
            text("""
                UPDATE menu_actions
                SET
                    action_title = :action_title,
                    permission_key = :permission_key,
                    button_color = :button_color,
                    button_icon = :button_icon,
                    sort_order = :sort_order,
                    is_visible = TRUE,
                    is_active = TRUE,
                    updated_by = :updated_by,
                    updated_at = NOW()
                WHERE menu_id = :menu_id
                  AND action_key = :action_key
            """),
            payload,
        )
        return

    await conn.execute(
        text("""
            INSERT INTO menu_actions (
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
            VALUES (
                :menu_id,
                :action_key,
                :action_title,
                :permission_key,
                :button_color,
                :button_icon,
                :sort_order,
                TRUE,
                TRUE,
                :created_by,
                :updated_by,
                NOW(),
                NOW()
            )
        """),
        {**payload, "created_by": SEED_BY},
    )


async def main() -> None:
    engine = create_async_engine(get_database_url())

    async with engine.begin() as conn:
        menu_result = await conn.execute(
            text("""
                SELECT id
                FROM menus
                WHERE menu_key = 'menu'
                  AND route_path = '/security/menus'
            """)
        )
        menu_row = menu_result.mappings().first()
        if not menu_row:
            raise RuntimeError("Navigation Builder menu row not found: menu_key='menu', route_path='/security/menus'")

        menu_id = int(menu_row["id"])

        for permission in PERMISSIONS:
            await ensure_permission(conn, permission)

        for action in MENU_ACTIONS:
            await ensure_menu_action(conn, menu_id, action)

    await engine.dispose()

    print("Navigation Builder menu actions seeded successfully.")
    print(f"Seeded/updated menu_actions: {len(MENU_ACTIONS)}")
    print(f"Seeded/updated permissions: {len(PERMISSIONS)}")


if __name__ == "__main__":
    asyncio.run(main())
