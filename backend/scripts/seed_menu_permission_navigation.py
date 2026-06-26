# E:\Audit\AMS\backend\scripts\seed_menu_permission_navigation.py

import asyncio

from sqlalchemy import func, select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.navigation_group import NavigationGroup
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


PERMISSIONS = [
    {
        "permission_key": "menu.menu_permission.view",
        "resource_type": "menu",
        "resource_key": "menu_permission",
        "action": "view",
        "description": "View menu permission mapping page.",
    },
    {
        "permission_key": "api.menu_permission.assign",
        "resource_type": "api",
        "resource_key": "menu_permission",
        "action": "assign",
        "description": "Assign permission to menu.",
    },
    {
        "permission_key": "api.menu_permission.remove",
        "resource_type": "api",
        "resource_key": "menu_permission",
        "action": "remove",
        "description": "Remove permission from menu.",
    },
]

SECURITY_GROUP = {
    "group_key": "security",
    "group_title": "Security",
    "group_icon": "ShieldCheck",
    "sort_order": 15,
}

MENU_PERMISSION_MENU = {
    "menu_key": "menu_permission",
    "menu_title": "Menu Permissions",
    "route_path": "/security/menu-permissions",
    "icon": "Menu",
    "permission_key": "menu.menu_permission.view",
    "sort_order": 36,
}

MENU_PERMISSION_ACTIONS = [
    {
        "action_key": "assign",
        "action_title": "Assign Permission",
        "permission_key": "api.menu_permission.assign",
        "button_color": "blue",
        "button_icon": "Plus",
        "sort_order": 10,
    },
    {
        "action_key": "remove",
        "action_title": "Remove Permission",
        "permission_key": "api.menu_permission.remove",
        "button_color": "red",
        "button_icon": "XCircle",
        "sort_order": 20,
    },
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        permission.resource_type = permission_data["resource_type"]
        permission.resource_key = permission_data["resource_key"]
        permission.action = permission_data["action"]
        permission.description = permission_data["description"]
        permission.is_active = True
        permission.updated_by = SYSTEM_USER

        print(f"Permission updated: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.flush()

    print(f"Permission created: {permission.permission_key}")
    return permission


async def get_or_create_security_group(db) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(
            NavigationGroup.group_key == SECURITY_GROUP["group_key"]
        )
    )
    group = result.scalar_one_or_none()

    if group:
        group.group_title = SECURITY_GROUP["group_title"]
        group.group_icon = SECURITY_GROUP["group_icon"]
        group.sort_order = SECURITY_GROUP["sort_order"]
        group.is_active = True
        group.is_visible = True
        group.updated_by = SYSTEM_USER

        print("Navigation group updated: security")
        return group

    group = NavigationGroup(
        group_key=SECURITY_GROUP["group_key"],
        group_title=SECURITY_GROUP["group_title"],
        group_icon=SECURITY_GROUP["group_icon"],
        sort_order=SECURITY_GROUP["sort_order"],
        is_active=True,
        is_visible=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.flush()

    print("Navigation group created: security")
    return group


async def get_or_create_menu_permission_menu(db, group_id: int) -> Menu:
    result = await db.execute(
        select(Menu).where(Menu.menu_key == MENU_PERMISSION_MENU["menu_key"])
    )
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = MENU_PERMISSION_MENU["menu_title"]
        menu.route_path = MENU_PERMISSION_MENU["route_path"]
        menu.icon = MENU_PERMISSION_MENU["icon"]
        menu.permission_key = MENU_PERMISSION_MENU["permission_key"]
        menu.sort_order = MENU_PERMISSION_MENU["sort_order"]
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER

        print("Menu updated: menu_permission")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key=MENU_PERMISSION_MENU["menu_key"],
        menu_title=MENU_PERMISSION_MENU["menu_title"],
        route_path=MENU_PERMISSION_MENU["route_path"],
        icon=MENU_PERMISSION_MENU["icon"],
        permission_key=MENU_PERMISSION_MENU["permission_key"],
        sort_order=MENU_PERMISSION_MENU["sort_order"],
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.flush()

    print("Menu created: menu_permission")
    return menu


async def get_or_create_menu_action(
    db,
    menu_id: int,
    action_data: dict,
) -> MenuAction:
    result = await db.execute(
        select(MenuAction).where(
            MenuAction.menu_id == menu_id,
            MenuAction.action_key == action_data["action_key"],
        )
    )
    action = result.scalar_one_or_none()

    if action:
        action.action_title = action_data["action_title"]
        action.permission_key = action_data["permission_key"]
        action.button_color = action_data["button_color"]
        action.button_icon = action_data["button_icon"]
        action.sort_order = action_data["sort_order"]
        action.is_visible = True
        action.is_active = True
        action.updated_by = SYSTEM_USER

        print(f"Menu action updated: menu_permission.{action.action_key}")
        return action

    action = MenuAction(
        menu_id=menu_id,
        action_key=action_data["action_key"],
        action_title=action_data["action_title"],
        permission_key=action_data["permission_key"],
        button_color=action_data["button_color"],
        button_icon=action_data["button_icon"],
        sort_order=action_data["sort_order"],
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(action)
    await db.flush()

    print(f"Menu action created: menu_permission.{action.action_key}")
    return action


async def grant_permissions_to_admin_roles(
    db,
    permissions: list[Permission],
) -> None:
    result = await db.execute(
        select(Role).where(
            func.lower(Role.role_name).in_(
                ["super admin", "administrator", "admin"]
            )
        )
    )
    admin_roles = list(result.scalars().all())

    if not admin_roles:
        print("No Super Admin/Admin role found. Permissions created only.")
        return

    for role in admin_roles:
        for permission in permissions:
            existing_result = await db.execute(
                select(RolePermission).where(
                    RolePermission.role_id == role.id,
                    RolePermission.permission_id == permission.id,
                )
            )
            role_permission = existing_result.scalar_one_or_none()

            if role_permission:
                role_permission.is_active = True
                role_permission.updated_by = SYSTEM_USER
                print(
                    f"Role permission updated: "
                    f"{role.role_name} -> {permission.permission_key}"
                )
                continue

            role_permission = RolePermission(
                role_id=role.id,
                permission_id=permission.id,
                is_active=True,
                created_by=SYSTEM_USER,
                updated_by=SYSTEM_USER,
            )

            db.add(role_permission)

            print(
                f"Role permission created: "
                f"{role.role_name} -> {permission.permission_key}"
            )


async def seed_menu_permission_navigation() -> None:
    async with AsyncSessionLocal() as db:
        permissions = []

        for permission_data in PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        group = await get_or_create_security_group(db)
        menu = await get_or_create_menu_permission_menu(db, group.id)

        for action_data in MENU_PERMISSION_ACTIONS:
            await get_or_create_menu_action(db, menu.id, action_data)

        await grant_permissions_to_admin_roles(db, permissions)

        await db.commit()

    print("Menu Permission navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_menu_permission_navigation())