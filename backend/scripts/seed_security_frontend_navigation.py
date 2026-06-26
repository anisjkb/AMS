# E:\Audit\AMS\backend\scripts\seed_security_frontend_navigation.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.navigation_group import NavigationGroup


SYSTEM_USER = "system"


async def get_or_create_security_group(db) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(NavigationGroup.group_key == "security")
    )
    group = result.scalar_one_or_none()

    if group:
        group.group_title = "Security"
        group.group_icon = "ShieldCheck"
        group.sort_order = 20
        group.is_collapsible = True
        group.is_visible = True
        group.group_color = "blue"
        group.group_permission_key = None
        group.is_active = True
        group.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(group)

        print("Security navigation group exists/updated.")
        return group

    group = NavigationGroup(
        group_key="security",
        group_title="Security",
        group_icon="ShieldCheck",
        parent_group_id=None,
        sort_order=20,
        is_collapsible=True,
        is_visible=True,
        group_badge=None,
        group_color="blue",
        group_permission_key=None,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.commit()
    await db.refresh(group)

    print("Security navigation group created.")
    return group


async def get_or_create_role_menu(db, group_id: int) -> Menu:
    result = await db.execute(select(Menu).where(Menu.menu_key == "role"))
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = "Roles"
        menu.route_path = "/security/roles"
        menu.icon = "ShieldCheck"
        menu.permission_key = "menu.role.view"
        menu.sort_order = 10
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(menu)

        print("Role menu exists/updated.")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key="role",
        menu_title="Roles",
        route_path="/security/roles",
        icon="ShieldCheck",
        permission_key="menu.role.view",
        sort_order=10,
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.commit()
    await db.refresh(menu)

    print("Role menu created.")
    return menu


async def get_or_create_menu_action(
    db,
    menu_id: int,
    action_key: str,
    action_title: str,
    permission_key: str,
    button_color: str,
    button_icon: str,
    sort_order: int,
) -> None:
    result = await db.execute(
        select(MenuAction).where(
            MenuAction.menu_id == menu_id,
            MenuAction.action_key == action_key,
        )
    )
    action = result.scalar_one_or_none()

    if action:
        action.action_title = action_title
        action.permission_key = permission_key
        action.button_color = button_color
        action.button_icon = button_icon
        action.sort_order = sort_order
        action.is_visible = True
        action.is_active = True
        action.updated_by = SYSTEM_USER

        await db.commit()

        print(f"Menu action exists/updated: {action_key}")
        return

    action = MenuAction(
        menu_id=menu_id,
        action_key=action_key,
        action_title=action_title,
        permission_key=permission_key,
        button_color=button_color,
        button_icon=button_icon,
        sort_order=sort_order,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(action)
    await db.commit()

    print(f"Menu action created: {action_key}")


async def seed_security_frontend_navigation():
    async with AsyncSessionLocal() as db:
        security_group = await get_or_create_security_group(db)
        role_menu = await get_or_create_role_menu(db, security_group.id)

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="create",
            action_title="Create",
            permission_key="api.role.create",
            button_color="blue",
            button_icon="Plus",
            sort_order=10,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="update",
            action_title="Update",
            permission_key="api.role.update",
            button_color="amber",
            button_icon="Edit3",
            sort_order=20,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="delete",
            action_title="Inactive",
            permission_key="api.role.delete",
            button_color="orange",
            button_icon="XCircle",
            sort_order=30,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="restore",
            action_title="Restore",
            permission_key="api.role.restore",
            button_color="emerald",
            button_icon="RotateCcw",
            sort_order=40,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="permanent_delete",
            action_title="Permanent Delete",
            permission_key="api.role.permanent_delete",
            button_color="red",
            button_icon="Trash2",
            sort_order=50,
        )

        print("Security frontend navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_security_frontend_navigation())