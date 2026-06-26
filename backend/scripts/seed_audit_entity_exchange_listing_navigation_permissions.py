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
    "sort_order": 30,
}


EXCHANGE_LISTING_MENU = {
    "menu_key": "audit_entity_exchange_listing",
    "menu_title": "Exchange Listings",
    "route_path": "/audit-entity-exchange-listings",
    "icon": "Building2",
    "permission_key": "menu.audit_entity_exchange_listing.view",
    "sort_order": 35,
}


PERMISSIONS = [
    {
        "permission_key": "menu.audit_entity_exchange_listing.view",
        "resource_type": "menu",
        "resource_key": "audit_entity_exchange_listing",
        "action": "view",
        "description": "View audit entity exchange listing page.",
    },
    {
        "permission_key": "api.audit_entity_exchange_listing.create",
        "resource_type": "api",
        "resource_key": "audit_entity_exchange_listing",
        "action": "create",
        "description": "Create audit entity exchange listing.",
    },
    {
        "permission_key": "api.audit_entity_exchange_listing.update",
        "resource_type": "api",
        "resource_key": "audit_entity_exchange_listing",
        "action": "update",
        "description": "Update audit entity exchange listing.",
    },
    {
        "permission_key": "api.audit_entity_exchange_listing.delete",
        "resource_type": "api",
        "resource_key": "audit_entity_exchange_listing",
        "action": "delete",
        "description": "Deactivate audit entity exchange listing.",
    },
    {
        "permission_key": "api.audit_entity_exchange_listing.restore",
        "resource_type": "api",
        "resource_key": "audit_entity_exchange_listing",
        "action": "restore",
        "description": "Restore audit entity exchange listing.",
    },
    {
        "permission_key": "api.audit_entity_exchange_listing.permanent_delete",
        "resource_type": "api",
        "resource_key": "audit_entity_exchange_listing",
        "action": "permanent_delete",
        "description": "Permanently delete audit entity exchange listing.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.create",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "create",
        "description": "Show create exchange listing button.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.update",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "update",
        "description": "Show update exchange listing button.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.inactive",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "inactive",
        "description": "Show inactive exchange listing button.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.delete",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "delete",
        "description": "Show delete exchange listing button.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.restore",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "restore",
        "description": "Show restore exchange listing button.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.permanent_delete",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "permanent_delete",
        "description": "Show permanent delete exchange listing button.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.export",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "export",
        "description": "Show export exchange listing button.",
    },
    {
        "permission_key": "button.audit_entity_exchange_listing.import",
        "resource_type": "button",
        "resource_key": "audit_entity_exchange_listing",
        "action": "import",
        "description": "Show import exchange listing button.",
    },
]


MENU_ACTIONS = [
    {
        "action_key": "create",
        "action_title": "Create",
        "permission_key": "button.audit_entity_exchange_listing.create",
        "button_color": "green",
        "button_icon": "Plus",
        "sort_order": 10,
    },
    {
        "action_key": "update",
        "action_title": "Update",
        "permission_key": "button.audit_entity_exchange_listing.update",
        "button_color": "blue",
        "button_icon": "Pencil",
        "sort_order": 20,
    },
    {
        "action_key": "inactive",
        "action_title": "Inactive",
        "permission_key": "button.audit_entity_exchange_listing.inactive",
        "button_color": "red",
        "button_icon": "Trash2",
        "sort_order": 30,
    },
    {
        "action_key": "delete",
        "action_title": "Delete",
        "permission_key": "button.audit_entity_exchange_listing.delete",
        "button_color": "red",
        "button_icon": "Trash2",
        "sort_order": 35,
    },
    {
        "action_key": "restore",
        "action_title": "Restore",
        "permission_key": "button.audit_entity_exchange_listing.restore",
        "button_color": "green",
        "button_icon": "RotateCcw",
        "sort_order": 40,
    },
    {
        "action_key": "permanent_delete",
        "action_title": "Permanent Delete",
        "permission_key": "button.audit_entity_exchange_listing.permanent_delete",
        "button_color": "red",
        "button_icon": "AlertTriangle",
        "sort_order": 50,
    },
    {
        "action_key": "export",
        "action_title": "Export",
        "permission_key": "button.audit_entity_exchange_listing.export",
        "button_color": "slate",
        "button_icon": "Download",
        "sort_order": 60,
    },
    {
        "action_key": "import",
        "action_title": "Import",
        "permission_key": "button.audit_entity_exchange_listing.import",
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
        group.is_visible = True
        group.is_active = True
        group.updated_by = SYSTEM_USER

        print("Navigation group updated: audit")
        return group

    group = NavigationGroup(
        group_key=AUDIT_GROUP["group_key"],
        group_title=AUDIT_GROUP["group_title"],
        group_icon=AUDIT_GROUP["group_icon"],
        sort_order=AUDIT_GROUP["sort_order"],
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.flush()

    print("Navigation group created: audit")
    return group


async def get_or_create_menu(db, group_id: int) -> Menu:
    result = await db.execute(
        select(Menu).where(
            Menu.menu_key == EXCHANGE_LISTING_MENU["menu_key"]
        )
    )
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = EXCHANGE_LISTING_MENU["menu_title"]
        menu.route_path = EXCHANGE_LISTING_MENU["route_path"]
        menu.icon = EXCHANGE_LISTING_MENU["icon"]
        menu.permission_key = EXCHANGE_LISTING_MENU["permission_key"]
        menu.sort_order = EXCHANGE_LISTING_MENU["sort_order"]
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER

        print("Menu updated: audit_entity_exchange_listing")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key=EXCHANGE_LISTING_MENU["menu_key"],
        menu_title=EXCHANGE_LISTING_MENU["menu_title"],
        route_path=EXCHANGE_LISTING_MENU["route_path"],
        icon=EXCHANGE_LISTING_MENU["icon"],
        permission_key=EXCHANGE_LISTING_MENU["permission_key"],
        sort_order=EXCHANGE_LISTING_MENU["sort_order"],
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.flush()

    print("Menu created: audit_entity_exchange_listing")
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

        print(f"Menu action updated: {action_data['action_key']}")
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

    print(f"Menu action created: {action_data['action_key']}")
    return action


async def get_or_create_menu_permission(
    db,
    menu_id: int,
    permission_id: int,
) -> None:
    result = await db.execute(
        select(MenuPermission).where(
            MenuPermission.menu_id == menu_id,
            MenuPermission.permission_id == permission_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.is_active = True
        existing.updated_by = SYSTEM_USER
        print("Menu permission already exists.")
        return

    mapping = MenuPermission(
        menu_id=menu_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(mapping)
    await db.flush()

    print("Menu permission created.")


async def get_or_create_menu_action_permission(
    db,
    menu_action_id: int,
    permission_id: int,
) -> None:
    result = await db.execute(
        select(MenuActionPermission).where(
            MenuActionPermission.menu_action_id == menu_action_id,
            MenuActionPermission.permission_id == permission_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.is_active = True
        existing.updated_by = SYSTEM_USER
        print("Menu action permission already exists.")
        return

    mapping = MenuActionPermission(
        menu_action_id=menu_action_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(mapping)
    await db.flush()

    print("Menu action permission created.")


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
            result = await db.execute(
                select(RolePermission).where(
                    RolePermission.role_id == role.id,
                    RolePermission.permission_id == permission.id,
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                existing.is_active = True
                existing.updated_by = SYSTEM_USER
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


async def seed_audit_entity_exchange_listing_navigation() -> None:
    async with AsyncSessionLocal() as db:
        permission_by_key: dict[str, Permission] = {}

        for permission_data in PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permission_by_key[permission.permission_key] = permission

        group = await get_or_create_audit_group(db)
        menu = await get_or_create_menu(db, group.id)

        menu_permission = permission_by_key[
            EXCHANGE_LISTING_MENU["permission_key"]
        ]

        await get_or_create_menu_permission(
            db=db,
            menu_id=menu.id,
            permission_id=menu_permission.id,
        )

        for action_data in MENU_ACTIONS:
            action = await get_or_create_menu_action(
                db=db,
                menu_id=menu.id,
                action_data=action_data,
            )

            action_permission = permission_by_key[action_data["permission_key"]]

            await get_or_create_menu_action_permission(
                db=db,
                menu_action_id=action.id,
                permission_id=action_permission.id,
            )

        await grant_permissions_to_admin_roles(
            db=db,
            permissions=list(permission_by_key.values()),
        )

        await db.commit()

    print("Audit Entity Exchange Listing navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_audit_entity_exchange_listing_navigation())
