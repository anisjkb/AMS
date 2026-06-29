# E:\Audit\AMS\backend\scripts\seed_security_menus_navigation.py

import asyncio
import importlib

from sqlalchemy import text

module = importlib.import_module("app.db.session")
engine = getattr(module, "engine")

SYSTEM_USER = "seed_security_menus_navigation"


async def main() -> None:
    async with engine.begin() as conn:
        security_group_id = await conn.scalar(
            text("""
                select id
                from navigation_groups
                where group_key = 'security'
                  and is_active = true
                limit 1
            """)
        )

        if security_group_id is None:
            raise RuntimeError("Security navigation group not found.")

        existing_menu_id = await conn.scalar(
            text("""
                select id
                from menus
                where menu_key = 'menu'
                   or route_path = '/security/menus'
                order by id
                limit 1
            """)
        )

        if existing_menu_id is None:
            result = await conn.execute(
                text("""
                    insert into menus (
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
                        created_by,
                        updated_by,
                        created_at,
                        updated_at
                    )
                    values (
                        :navigation_group_id,
                        null,
                        'menu',
                        'Menus',
                        '/security/menus',
                        'Menu',
                        'menu.menu.view',
                        55,
                        1,
                        false,
                        true,
                        true,
                        :system_user,
                        :system_user,
                        now(),
                        now()
                    )
                    returning id
                """),
                {
                    "navigation_group_id": security_group_id,
                    "system_user": SYSTEM_USER,
                },
            )

            menu_id = result.scalar_one()
            print(f"Created Security Menus navigation item id={menu_id}")
        else:
            menu_id = existing_menu_id

            await conn.execute(
                text("""
                    update menus
                    set navigation_group_id = :navigation_group_id,
                        parent_menu_id = null,
                        menu_key = 'menu',
                        menu_title = 'Menus',
                        route_path = '/security/menus',
                        icon = 'Menu',
                        permission_key = 'menu.menu.view',
                        sort_order = 55,
                        menu_level = 1,
                        is_expandable = false,
                        is_visible = true,
                        is_active = true,
                        updated_by = :system_user,
                        updated_at = now()
                    where id = :menu_id
                """),
                {
                    "navigation_group_id": security_group_id,
                    "menu_id": menu_id,
                    "system_user": SYSTEM_USER,
                },
            )

            print(f"Updated Security Menus navigation item id={menu_id}")

        print("Security Menus navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(main())
