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


SYSTEM_USER = "system"


AUDIT_GROUP = {
    "group_key": "audit",
    "group_title": "Audit",
    "group_icon": "ClipboardCheck",
    "sort_order": 20,
}


BUSINESS_ACTIVITY_MENU = {
    "menu_key": "audit_entity_business_activity",
    "menu_title": "Business Activities",
    "route_path": "/audit-entity-business-activities",
    "icon": "Network",
    "permission_key": "menu.audit_entity_business_activity.view",
    "sort_order": 30,
}


PERMISSIONS = [
    {
        "permission_key": "menu.audit_entity_business_activity.view",
        "resource_type": "menu",
        "resource_key": "audit_entity_business_activity",
        "action": "view",
        "description": "View Audit Entity Business Activities menu and page.",
    },
    {
        "permission_key": "api.audit_entity_business_activity.view",
        "resource_type": "api",
        "resource_key": "audit_entity_business_activity",
        "action": "view",
        "description": "View audit entity business activity records.",
    },
    {
        "permission_key": "api.audit_entity_business_activity.create",
        "resource_type": "api",
        "resource_key": "audit_entity_business_activity",
        "action": "create",
        "description": "Create audit entity business activity records.",
    },
    {
        "permission_key": "api.audit_entity_business_activity.update",
        "resource_type": "api",
        "resource_key": "audit_entity_business_activity",
        "action": "update",
        "description": "Update audit entity business activity records.",
    },
    {
        "permission_key": "api.audit_entity_business_activity.delete",
        "resource_type": "api",
        "resource_key": "audit_entity_business_activity",
        "action": "delete",
        "description": "Deactivate audit entity business activity records.",
    },
    {
        "permission_key": "api.audit_entity_business_activity.restore",
        "resource_type": "api",
        "resource_key": "audit_entity_business_activity",
        "action": "restore",
        "description": "Restore inactive audit entity business activity records.",
    },
    {
        "permission_key": "api.audit_entity_business_activity.permanent_delete",
        "resource_type": "api",
        "resource_key": "audit_entity_business_activity",
        "action": "permanent_delete",
        "description": "Permanently delete audit entity business activity records.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.view",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "view",
        "description": "Show audit entity business activity view action.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.create",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "create",
        "description": "Show audit entity business activity create button.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.update",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "update",
        "description": "Show audit entity business activity update button.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.delete",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "delete",
        "description": "Show audit entity business activity inactive/delete button.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.restore",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "restore",
        "description": "Show audit entity business activity restore button.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.permanent_delete",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "permanent_delete",
        "description": "Show audit entity business activity permanent delete button.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.export",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "export",
        "description": "Show audit entity business activity export button.",
    },
    {
        "permission_key": "button.audit_entity_business_activity.import",
        "resource_type": "button",
        "resource_key": "audit_entity_business_activity",
        "action": "import",
        "description": "Show audit entity business activity import button.",
    },
]


MENU_ACTIONS = [
    {
        "action_key": "create",
        "action_title": "Create",
        "permission_key": "button.audit_entity_business_activity.create",
        "button_color": "blue",
        "button_icon": "Plus",
        "sort_order": 10,
    },
    {
        "action_key": "update",
        "action_title": "Edit",
        "permission_key": "button.audit_entity_business_activity.update",
        "button_color": "amber",
        "button_icon": "Pencil",
        "sort_order": 20,
    },
    {
        "action_key": "delete",
        "action_title": "Inactive",
        "permission_key": "button.audit_entity_business_activity.delete",
        "button_color": "red",
        "button_icon": "Trash2",
        "sort_order": 30,
    },
    {
        "action_key": "restore",
        "action_title": "Restore",
        "permission_key": "button.audit_entity_business_activity.restore",
        "button_color": "green",
        "button_icon": "RotateCcw",
        "sort_order": 40,
    },
    {
        "action_key": "permanent_delete",
        "action_title": "Permanent Delete",
        "permission_key": "button.audit_entity_business_activity.permanent_delete",
        "button_color": "red",
        "button_icon": "Trash",
        "sort_order": 50,
    },
    {
        "action_key": "export",
        "action_title": "Export",
        "permission_key": "button.audit_entity_business_activity.export",
        "button_color": "slate",
        "button_icon": "Download",
        "sort_order": 60,
    },
    {
        "action_key": "import",
        "action_title": "Import",
        "permission_key": "button.audit_entity_business_activity.import",
        "button_color": "slate",
        "button_icon": "Upload",
        "sort_order": 70,
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


async def get_permission_by_key(db, permission_key: str) -> Permission:
    result = await db.execute(
        select(Permission).where(Permission.permission_key == permission_key)
    )
    permission = result.scalar_one_or_none()

    if not permission:
        raise RuntimeError(f"Permission not found: {permission_key}")

    return permission


async def get_or_create_audit_group(db) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(
            NavigationGroup.group_key == AUDIT_GROUP["group_key"]
        )
    )
    group = result.scalar_one_or_none()

    if group:
        group.group_title = AUDIT_GROUP["group_title"]
        group.group_icon = AUDIT_GROUP["group_icon"]
        group.sort_order = AUDIT_GROUP["sort_order"]
        group.group_permission_key = None
        group.is_active = True
        group.is_visible = True
        group.updated_by = SYSTEM_USER

        print("Navigation group updated: audit")
        return group

    group = NavigationGroup(
        group_key=AUDIT_GROUP["group_key"],
        group_title=AUDIT_GROUP["group_title"],
        group_icon=AUDIT_GROUP["group_icon"],
        sort_order=AUDIT_GROUP["sort_order"],
        group_permission_key=None,
        is_active=True,
        is_visible=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.flush()

    print("Navigation group created: audit")
    return group


async def get_or_create_menu(db, group_id: int) -> Menu:
    result = await db.execute(
        select(Menu).where(Menu.menu_key == BUSINESS_ACTIVITY_MENU["menu_key"])
    )
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = BUSINESS_ACTIVITY_MENU["menu_title"]
        menu.route_path = BUSINESS_ACTIVITY_MENU["route_path"]
        menu.icon = BUSINESS_ACTIVITY_MENU["icon"]
        menu.permission_key = BUSINESS_ACTIVITY_MENU["permission_key"]
        menu.sort_order = BUSINESS_ACTIVITY_MENU["sort_order"]
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER

        print("Menu updated: audit_entity_business_activity")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key=BUSINESS_ACTIVITY_MENU["menu_key"],
        menu_title=BUSINESS_ACTIVITY_MENU["menu_title"],
        route_path=BUSINESS_ACTIVITY_MENU["route_path"],
        icon=BUSINESS_ACTIVITY_MENU["icon"],
        permission_key=BUSINESS_ACTIVITY_MENU["permission_key"],
        sort_order=BUSINESS_ACTIVITY_MENU["sort_order"],
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.flush()

    print("Menu created: audit_entity_business_activity")
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

        print(
            f"Menu action updated: "
            f"audit_entity_business_activity.{action.action_key}"
        )
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

    print(
        f"Menu action created: "
        f"audit_entity_business_activity.{action.action_key}"
    )
    return action


async def get_or_create_menu_permission(
    db,
    menu_id: int,
    permission_id: int,
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

        print("Menu permission mapping updated: audit_entity_business_activity")
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

    print("Menu permission mapping created: audit_entity_business_activity")
    return mapping


async def get_or_create_menu_action_permission(
    db,
    menu_action_id: int,
    permission_id: int,
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

        print(
            f"Menu action permission mapping updated: "
            f"audit_entity_business_activity.{action_key}"
        )
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

    print(
        f"Menu action permission mapping created: "
        f"audit_entity_business_activity.{action_key}"
    )
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


async def seed_business_activity_navigation_permissions() -> None:
    async with AsyncSessionLocal() as db:
        permissions = []

        for permission_data in PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        group = await get_or_create_audit_group(db)
        menu = await get_or_create_menu(db, group.id)

        menu_permission = await get_permission_by_key(
            db,
            BUSINESS_ACTIVITY_MENU["permission_key"],
        )
        await get_or_create_menu_permission(
            db=db,
            menu_id=menu.id,
            permission_id=menu_permission.id,
        )

        for action_data in MENU_ACTIONS:
            action = await get_or_create_menu_action(db, menu.id, action_data)
            action_permission = await get_permission_by_key(
                db,
                action_data["permission_key"],
            )
            await get_or_create_menu_action_permission(
                db=db,
                menu_action_id=action.id,
                permission_id=action_permission.id,
                action_key=action_data["action_key"],
            )

        await grant_permissions_to_admin_roles(db, permissions)

        await db.commit()

    print("Audit Entity Business Activity navigation and permission seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_business_activity_navigation_permissions())
