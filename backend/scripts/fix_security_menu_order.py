# E:\Audit\AMS\backend\scripts\fix_security_menu_order.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu


SECURITY_MENU_ORDER = [
    ("role", 10),
    ("permission", 20),
    ("user", 30),
    ("role_permission", 40),
    ("user_role", 50),
    ("menu_permission", 60),
    ("menu_action_permission", 70),
]


async def fix_security_menu_order() -> None:
    async with AsyncSessionLocal() as db:
        for menu_key, sort_order in SECURITY_MENU_ORDER:
            result = await db.execute(
                select(Menu).where(Menu.menu_key == menu_key)
            )
            menu = result.scalar_one_or_none()

            if not menu:
                print(f"Menu not found: {menu_key}")
                continue

            menu.sort_order = sort_order
            menu.is_active = True
            menu.is_visible = True
            menu.updated_by = "system"

            print(f"Updated: {menu_key} -> {sort_order}")

        await db.commit()

    print("Security menu order fixed successfully.")


if __name__ == "__main__":
    asyncio.run(fix_security_menu_order())