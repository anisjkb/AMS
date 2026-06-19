import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.navigation_group import NavigationGroup


SYSTEM_USER = "system"


NAVIGATION_GROUPS = [
    {
        "group_key": "dashboard",
        "group_title": "Dashboard",
        "group_icon": "LayoutDashboard",
        "sort_order": 10,
    },
    {
        "group_key": "organization",
        "group_title": "Organization",
        "group_icon": "Building2",
        "sort_order": 20,
    },
    {
        "group_key": "audit_universe",
        "group_title": "Audit Universe",
        "group_icon": "ClipboardCheck",
        "sort_order": 30,
    },
    {
        "group_key": "execution",
        "group_title": "Execution",
        "group_icon": "FolderKanban",
        "sort_order": 40,
    },
    {
        "group_key": "reporting",
        "group_title": "Reporting",
        "group_icon": "BarChart3",
        "sort_order": 50,
    },
    {
        "group_key": "administration",
        "group_title": "Administration",
        "group_icon": "Settings",
        "sort_order": 60,
    },
]


MENUS = [
    {
        "group_key": "dashboard",
        "menu_key": "dashboard",
        "menu_title": "Dashboard",
        "route_path": "/dashboard",
        "icon": "LayoutDashboard",
        "permission_key": None,
        "sort_order": 10,
    },
    {
        "group_key": "organization",
        "menu_key": "company",
        "menu_title": "Company",
        "route_path": "/companies",
        "icon": "Building2",
        "permission_key": "menu.company.view",
        "sort_order": 10,
    },
    {
        "group_key": "organization",
        "menu_key": "branch",
        "menu_title": "Branch",
        "route_path": "/branches",
        "icon": "GitBranch",
        "permission_key": "menu.branch.view",
        "sort_order": 20,
    },
    {
        "group_key": "organization",
        "menu_key": "department",
        "menu_title": "Department",
        "route_path": "/departments",
        "icon": "Network",
        "permission_key": "menu.department.view",
        "sort_order": 30,
    },
    {
        "group_key": "organization",
        "menu_key": "designation",
        "menu_title": "Designation",
        "route_path": "/designations",
        "icon": "BadgeCheck",
        "permission_key": "menu.designation.view",
        "sort_order": 40,
    },
    {
        "group_key": "organization",
        "menu_key": "employee",
        "menu_title": "Employee",
        "route_path": "/employees",
        "icon": "Users",
        "permission_key": "menu.employee.view",
        "sort_order": 50,
    },
]


DEFAULT_ACTIONS = [
    {
        "action_key": "create",
        "action_title": "Create",
        "button_color": "primary",
        "button_icon": "Plus",
        "sort_order": 10,
    },
    {
        "action_key": "update",
        "action_title": "Edit",
        "button_color": "warning",
        "button_icon": "Pencil",
        "sort_order": 20,
    },
    {
        "action_key": "delete",
        "action_title": "Delete",
        "button_color": "danger",
        "button_icon": "Trash2",
        "sort_order": 30,
    },
    {
        "action_key": "restore",
        "action_title": "Restore",
        "button_color": "success",
        "button_icon": "RotateCcw",
        "sort_order": 40,
    },
    {
        "action_key": "permanent_delete",
        "action_title": "Permanent Delete",
        "button_color": "danger",
        "button_icon": "BadgeX",
        "sort_order": 50,
    },
    {
        "action_key": "export",
        "action_title": "Export",
        "button_color": "secondary",
        "button_icon": "Download",
        "sort_order": 60,
    },
    {
        "action_key": "import",
        "action_title": "Import",
        "button_color": "secondary",
        "button_icon": "Upload",
        "sort_order": 70,
    },
]


async def get_or_create_group(db, group_data):
    result = await db.execute(
        select(NavigationGroup).where(
            NavigationGroup.group_key == group_data["group_key"]
        )
    )
    group = result.scalar_one_or_none()

    if group:
        return group

    group = NavigationGroup(
        **group_data,
        is_active=True,
        is_visible=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.commit()
    await db.refresh(group)

    print(f"Navigation group created: {group.group_key}")
    return group


async def get_or_create_menu(db, menu_data, group_id):
    result = await db.execute(
        select(Menu).where(Menu.menu_key == menu_data["menu_key"])
    )
    menu = result.scalar_one_or_none()

    if menu:
        return menu

    data = menu_data.copy()
    data.pop("group_key")

    menu = Menu(
        **data,
        navigation_group_id=group_id,
        menu_level=1,
        is_expandable=False,
        is_active=True,
        is_visible=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.commit()
    await db.refresh(menu)

    print(f"Menu created: {menu.menu_key}")
    return menu


async def get_or_create_action(db, menu: Menu, action_data):
    permission_key = f"button.{menu.menu_key}.{action_data['action_key']}"

    result = await db.execute(
        select(MenuAction).where(
            MenuAction.menu_id == menu.id,
            MenuAction.action_key == action_data["action_key"],
        )
    )
    action = result.scalar_one_or_none()

    if action:
        return action

    action = MenuAction(
        menu_id=menu.id,
        action_key=action_data["action_key"],
        action_title=action_data["action_title"],
        permission_key=permission_key,
        button_color=action_data["button_color"],
        button_icon=action_data["button_icon"],
        sort_order=action_data["sort_order"],
        is_active=True,
        is_visible=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(action)
    await db.commit()
    await db.refresh(action)

    print(f"Menu action created: {menu.menu_key}.{action.action_key}")
    return action


async def seed_navigation():
    async with AsyncSessionLocal() as db:
        group_map = {}

        for group_data in NAVIGATION_GROUPS:
            group = await get_or_create_group(db, group_data)
            group_map[group.group_key] = group

        for menu_data in MENUS:
            group = group_map[menu_data["group_key"]]
            menu = await get_or_create_menu(db, menu_data, group.id)

            if menu.menu_key != "dashboard":
                for action_data in DEFAULT_ACTIONS:
                    await get_or_create_action(db, menu, action_data)

        print("Navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_navigation())