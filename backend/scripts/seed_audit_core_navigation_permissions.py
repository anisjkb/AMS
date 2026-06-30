import asyncio

from sqlalchemy import func, select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission
from app.models.menu_permission import MenuPermission
from app.models.navigation_group import NavigationGroup
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "c24_audit_core_navigation_seed"


AUDIT_GROUP_KEY = "audit"
AUDIT_OPERATION_MENU_KEY = "audit_operation"


MEETING_PARENT_MENU = {
    "menu_key": "audit_core",
    "menu_title": "Audit Core",
    "route_path": None,
    "icon": "CalendarDays",
    "permission_key": None,
    "sort_order": 50,
    "menu_level": 2,
    "is_expandable": True,
    "initial_is_visible": True,
}


MEETING_CHILD_MENUS = [
    {
        "menu_key": "audit_master",
        "menu_title": "Audit Master",
        "route_path": "/audit-core/audit-master",
        "icon": "ClipboardList",
        "permission_key": "menu.audit_master.view",
        "sort_order": 10,
        "resource_key": "audit_master",
    },
    {
        "menu_key": "audit_team",
        "menu_title": "Audit Teams",
        "route_path": "/audit-core/teams",
        "icon": "Users",
        "permission_key": "menu.audit_team.view",
        "sort_order": 20,
        "resource_key": "audit_team",
    },
    {
        "menu_key": "audit_team_member",
        "menu_title": "Audit Team Members",
        "route_path": "/audit-core/team-members",
        "icon": "UserRoundCog",
        "permission_key": "menu.audit_team_member.view",
        "sort_order": 30,
        "resource_key": "audit_team_member",
    },
    {
        "menu_key": "audit_visit_info",
        "menu_title": "Audit Visit Info",
        "route_path": "/audit-core/visit-info",
        "icon": "MapPinned",
        "permission_key": "menu.audit_visit_info.view",
        "sort_order": 40,
        "resource_key": "audit_visit_info",
    },
    {
        "menu_key": "audit_discussion_issue",
        "menu_title": "Audit Discussion Issues",
        "route_path": "/audit-core/discussion-issues",
        "icon": "MessagesSquare",
        "permission_key": "menu.audit_discussion_issue.view",
        "sort_order": 50,
        "resource_key": "audit_discussion_issue",
    },
    {
        "menu_key": "audit_visit_observation",
        "menu_title": "Audit Visit Observations",
        "route_path": "/audit-core/visit-observations",
        "icon": "ListChecks",
        "permission_key": "menu.audit_visit_observation.view",
        "sort_order": 60,
        "resource_key": "audit_visit_observation",
    },
]


API_ACTIONS = [
    ("view", "View records."),
    ("create", "Create records."),
    ("update", "Update records."),
    ("delete", "Deactivate records."),
    ("restore", "Restore inactive records."),
    ("permanent_delete", "Permanently delete records."),
]


BUTTON_ACTIONS = [
    ("view", "Show view action."),
    ("create", "Show create button."),
    ("update", "Show update button."),
    ("delete", "Show inactive/delete button."),
    ("restore", "Show restore button."),
    ("permanent_delete", "Show permanent delete button."),
    ("export", "Show export button."),
    ("import", "Show import button."),
]


MENU_ACTIONS = [
    {
        "action_key": "create",
        "action_title": "Create",
        "button_color": "blue",
        "button_icon": "Plus",
        "sort_order": 10,
    },
    {
        "action_key": "update",
        "action_title": "Edit",
        "button_color": "amber",
        "button_icon": "Pencil",
        "sort_order": 20,
    },
    {
        "action_key": "delete",
        "action_title": "Inactive",
        "button_color": "red",
        "button_icon": "Trash2",
        "sort_order": 30,
    },
    {
        "action_key": "restore",
        "action_title": "Restore",
        "button_color": "green",
        "button_icon": "RotateCcw",
        "sort_order": 40,
    },
    {
        "action_key": "permanent_delete",
        "action_title": "Permanent Delete",
        "button_color": "red",
        "button_icon": "AlertTriangle",
        "sort_order": 50,
    },
    {
        "action_key": "export",
        "action_title": "Export",
        "button_color": "slate",
        "button_icon": "Download",
        "sort_order": 60,
    },
    {
        "action_key": "import",
        "action_title": "Import",
        "button_color": "slate",
        "button_icon": "Upload",
        "sort_order": 70,
    },
]


def build_permissions() -> list[dict]:
    permissions: list[dict] = []

    for menu in MEETING_CHILD_MENUS:
        resource_key = menu["resource_key"]
        title = menu["menu_title"]

        permissions.append(
            {
                "permission_key": menu["permission_key"],
                "resource_type": "menu",
                "resource_key": resource_key,
                "action": "view",
                "description": f"View {title} menu and page.",
            }
        )

        for action, description in API_ACTIONS:
            permissions.append(
                {
                    "permission_key": f"api.{resource_key}.{action}",
                    "resource_type": "api",
                    "resource_key": resource_key,
                    "action": action,
                    "description": f"{description} {title}",
                }
            )

        for action, description in BUTTON_ACTIONS:
            permissions.append(
                {
                    "permission_key": f"button.{resource_key}.{action}",
                    "resource_type": "button",
                    "resource_key": resource_key,
                    "action": action,
                    "description": f"{description} {title}",
                }
            )

    return permissions


PERMISSIONS = build_permissions()


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


async def get_permission_by_key(db, permission_key: str) -> Permission:
    result = await db.execute(
        select(Permission).where(Permission.permission_key == permission_key)
    )
    permission = result.scalar_one_or_none()

    if not permission:
        raise RuntimeError(f"Permission not found: {permission_key}")

    return permission


async def get_audit_group(db) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(NavigationGroup.group_key == AUDIT_GROUP_KEY)
    )
    group = result.scalar_one_or_none()

    if not group:
        raise RuntimeError("Audit navigation group not found.")

    group.is_active = True
    group.is_visible = True
    group.updated_by = SYSTEM_USER

    print("Navigation group verified: audit")
    return group


async def get_audit_operation_menu(db) -> Menu:
    result = await db.execute(
        select(Menu).where(Menu.menu_key == AUDIT_OPERATION_MENU_KEY)
    )
    menu = result.scalar_one_or_none()

    if not menu:
        raise RuntimeError("Audit Operation parent menu not found.")

    menu.is_active = True
    menu.is_visible = True
    menu.is_expandable = True
    menu.updated_by = SYSTEM_USER

    print("Parent menu verified: audit_operation")
    return menu


async def get_or_create_menu(
    db,
    group_id: int,
    parent_menu_id: int | None,
    menu_data: dict,
    menu_level: int,
) -> Menu:
    result = await db.execute(
        select(Menu).where(Menu.menu_key == menu_data["menu_key"])
    )
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = parent_menu_id
        menu.menu_title = menu_data["menu_title"]
        menu.route_path = menu_data["route_path"]
        menu.icon = menu_data["icon"]
        menu.permission_key = menu_data["permission_key"]
        menu.sort_order = menu_data["sort_order"]
        menu.menu_level = menu_level
        menu.is_expandable = menu_data.get("is_expandable", False)
        menu.is_active = True
        if "is_visible" in menu_data:
            menu.is_visible = menu_data["is_visible"]
        elif "initial_is_visible" in menu_data:
            menu.is_visible = menu_data["initial_is_visible"]
        menu.updated_by = SYSTEM_USER

        print(f"Menu updated: {menu.menu_key}")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=parent_menu_id,
        menu_key=menu_data["menu_key"],
        menu_title=menu_data["menu_title"],
        route_path=menu_data["route_path"],
        icon=menu_data["icon"],
        permission_key=menu_data["permission_key"],
        sort_order=menu_data["sort_order"],
        menu_level=menu_level,
        is_expandable=menu_data.get("is_expandable", False),
        is_visible=menu_data.get("initial_is_visible", False),
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.flush()

    print(f"Menu created: {menu.menu_key}")
    return menu


async def get_or_create_menu_permission(
    db,
    menu_id: int,
    permission_id: int,
    menu_key: str,
) -> MenuPermission:
    result = await db.execute(
        select(MenuPermission).where(
            MenuPermission.menu_id == menu_id,
            MenuPermission.permission_id == permission_id,
        )
    )
    mapping = result.scalar_one_or_none()

    if mapping:
        mapping.is_active = True
        mapping.updated_by = SYSTEM_USER

        print(f"Menu permission mapping updated: {menu_key}")
        return mapping

    mapping = MenuPermission(
        menu_id=menu_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(mapping)
    await db.flush()

    print(f"Menu permission mapping created: {menu_key}")
    return mapping


async def get_or_create_menu_action(
    db,
    menu_id: int,
    resource_key: str,
    action_data: dict,
) -> MenuAction:
    result = await db.execute(
        select(MenuAction).where(
            MenuAction.menu_id == menu_id,
            MenuAction.action_key == action_data["action_key"],
        )
    )
    action = result.scalar_one_or_none()

    permission_key = f"button.{resource_key}.{action_data['action_key']}"

    if action:
        action.action_title = action_data["action_title"]
        action.permission_key = permission_key
        action.button_color = action_data["button_color"]
        action.button_icon = action_data["button_icon"]
        action.sort_order = action_data["sort_order"]
        action.is_visible = True
        action.is_active = True
        action.updated_by = SYSTEM_USER

        print(f"Menu action updated: {resource_key}.{action.action_key}")
        return action

    action = MenuAction(
        menu_id=menu_id,
        action_key=action_data["action_key"],
        action_title=action_data["action_title"],
        permission_key=permission_key,
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

    print(f"Menu action created: {resource_key}.{action.action_key}")
    return action


async def get_or_create_menu_action_permission(
    db,
    menu_action_id: int,
    permission_id: int,
    resource_key: str,
    action_key: str,
) -> MenuActionPermission:
    result = await db.execute(
        select(MenuActionPermission).where(
            MenuActionPermission.menu_action_id == menu_action_id,
            MenuActionPermission.permission_id == permission_id,
        )
    )
    mapping = result.scalar_one_or_none()

    if mapping:
        mapping.is_active = True
        mapping.updated_by = SYSTEM_USER

        print(f"Menu action permission mapping updated: {resource_key}.{action_key}")
        return mapping

    mapping = MenuActionPermission(
        menu_action_id=menu_action_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(mapping)
    await db.flush()

    print(f"Menu action permission mapping created: {resource_key}.{action_key}")
    return mapping


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


async def seed_audit_core_navigation_permissions() -> None:
    async with AsyncSessionLocal() as db:
        permissions = []

        for permission_data in PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        group = await get_audit_group(db)
        audit_operation_menu = await get_audit_operation_menu(db)

        audit_core_parent = await get_or_create_menu(
            db=db,
            group_id=group.id,
            parent_menu_id=audit_operation_menu.id,
            menu_data=MEETING_PARENT_MENU,
            menu_level=2,
        )

        for child_data in MEETING_CHILD_MENUS:
            child_menu = await get_or_create_menu(
                db=db,
                group_id=group.id,
                parent_menu_id=audit_core_parent.id,
                menu_data={
                    **child_data,
                    "is_expandable": False,
                    "initial_is_visible": False,
                    "is_visible": False,
                },
                menu_level=3,
            )

            menu_permission = await get_permission_by_key(
                db,
                child_data["permission_key"],
            )

            await get_or_create_menu_permission(
                db=db,
                menu_id=child_menu.id,
                permission_id=menu_permission.id,
                menu_key=child_data["menu_key"],
            )

            for action_data in MENU_ACTIONS:
                action = await get_or_create_menu_action(
                    db=db,
                    menu_id=child_menu.id,
                    resource_key=child_data["resource_key"],
                    action_data=action_data,
                )

                action_permission = await get_permission_by_key(
                    db,
                    f"button.{child_data['resource_key']}.{action_data['action_key']}",
                )

                await get_or_create_menu_action_permission(
                    db=db,
                    menu_action_id=action.id,
                    permission_id=action_permission.id,
                    resource_key=child_data["resource_key"],
                    action_key=action_data["action_key"],
                )

        await grant_permissions_to_admin_roles(db, permissions)

        await db.commit()

    print("Audit Core navigation and permission seed completed.")
    print(f"Seeded/updated permissions: {len(PERMISSIONS)}")
    print(f"Seeded/updated child menus: {len(MEETING_CHILD_MENUS)}")
    print(f"Seeded/updated menu actions: {len(MEETING_CHILD_MENUS) * len(MENU_ACTIONS)}")


if __name__ == "__main__":
    asyncio.run(seed_audit_core_navigation_permissions())
