import asyncio

from sqlalchemy import func, select

from app.db.session import AsyncSessionLocal
from app.models.audit_entity_director import AuditEntityDirectorType
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission
from app.models.menu_permission import MenuPermission
from app.models.navigation_group import NavigationGroup
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


DIRECTOR_TYPES = [
    ("001", "Chairman", "Chairman of the entity."),
    ("002", "Managing Director", "Managing director of the entity."),
    ("003", "Director", "Director of the entity."),
    ("004", "Independent Director", "Independent director."),
    ("005", "Nominee Director", "Nominee director."),
    ("006", "Owner", "Owner of the entity."),
    ("007", "Proprietor", "Proprietor of the entity."),
    ("008", "Partner", "Partner of the entity."),
    ("009", "Shareholder", "Shareholder of the entity."),
    ("010", "Beneficial Owner", "Beneficial owner of the entity."),
    ("011", "Authorized Signatory", "Authorized signatory."),
]


AUDIT_GROUP = {
    "group_key": "audit",
    "group_title": "Audit",
    "group_icon": "ClipboardCheck",
    "sort_order": 30,
}


DIRECTOR_MENU = {
    "menu_key": "audit_entity_director",
    "menu_title": "Directors / Owners",
    "route_path": "/audit-entity-directors",
    "icon": "UsersRound",
    "permission_key": "menu.audit_entity_director.view",
    "sort_order": 50,
}


PERMISSIONS = [
    {
        "permission_key": "menu.audit_entity_director.view",
        "resource_type": "menu",
        "resource_key": "audit_entity_director",
        "action": "view",
        "description": "View audit entity directors/owners page.",
    },
    {
        "permission_key": "api.audit_entity_director.create",
        "resource_type": "api",
        "resource_key": "audit_entity_director",
        "action": "create",
        "description": "Create audit entity director/owner.",
    },
    {
        "permission_key": "api.audit_entity_director.update",
        "resource_type": "api",
        "resource_key": "audit_entity_director",
        "action": "update",
        "description": "Update audit entity director/owner.",
    },
    {
        "permission_key": "api.audit_entity_director.delete",
        "resource_type": "api",
        "resource_key": "audit_entity_director",
        "action": "delete",
        "description": "Deactivate audit entity director/owner.",
    },
    {
        "permission_key": "api.audit_entity_director.restore",
        "resource_type": "api",
        "resource_key": "audit_entity_director",
        "action": "restore",
        "description": "Restore audit entity director/owner.",
    },
    {
        "permission_key": "api.audit_entity_director.permanent_delete",
        "resource_type": "api",
        "resource_key": "audit_entity_director",
        "action": "permanent_delete",
        "description": "Permanently delete audit entity director/owner.",
    },
    {
        "permission_key": "button.audit_entity_director.create",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "create",
        "description": "Show create director/owner button.",
    },
    {
        "permission_key": "button.audit_entity_director.update",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "update",
        "description": "Show update director/owner button.",
    },
    {
        "permission_key": "button.audit_entity_director.inactive",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "inactive",
        "description": "Show inactive director/owner button.",
    },
    {
        "permission_key": "button.audit_entity_director.delete",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "delete",
        "description": "Show delete director/owner button.",
    },
    {
        "permission_key": "button.audit_entity_director.restore",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "restore",
        "description": "Show restore director/owner button.",
    },
    {
        "permission_key": "button.audit_entity_director.permanent_delete",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "permanent_delete",
        "description": "Show permanent delete director/owner button.",
    },
    {
        "permission_key": "button.audit_entity_director.export",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "export",
        "description": "Show export director/owner button.",
    },
    {
        "permission_key": "button.audit_entity_director.import",
        "resource_type": "button",
        "resource_key": "audit_entity_director",
        "action": "import",
        "description": "Show import director/owner button.",
    },
]


MENU_ACTIONS = [
    ("create", "Create", "button.audit_entity_director.create", "green", "Plus", 10),
    ("update", "Update", "button.audit_entity_director.update", "blue", "Pencil", 20),
    ("inactive", "Inactive", "button.audit_entity_director.inactive", "red", "Trash2", 30),
    ("delete", "Delete", "button.audit_entity_director.delete", "red", "Trash2", 35),
    ("restore", "Restore", "button.audit_entity_director.restore", "green", "RotateCcw", 40),
    (
        "permanent_delete",
        "Permanent Delete",
        "button.audit_entity_director.permanent_delete",
        "red",
        "AlertTriangle",
        50,
    ),
    ("export", "Export", "button.audit_entity_director.export", "slate", "Download", 60),
    ("import", "Import", "button.audit_entity_director.import", "slate", "Upload", 70),
]


async def seed_director_types(db) -> None:
    for code, name, description in DIRECTOR_TYPES:
        result = await db.execute(
            select(AuditEntityDirectorType).where(
                AuditEntityDirectorType.director_type_code == code
            )
        )
        director_type = result.scalar_one_or_none()

        if director_type:
            director_type.director_type_name = name
            director_type.description = description
            director_type.is_active = True
            director_type.updated_by = SYSTEM_USER
            print(f"Director type updated: {code} - {name}")
            continue

        director_type = AuditEntityDirectorType(
            director_type_code=code,
            director_type_name=name,
            description=description,
            is_active=True,
            created_by=SYSTEM_USER,
            updated_by=SYSTEM_USER,
        )
        db.add(director_type)
        await db.flush()

        print(f"Director type created: {code} - {name}")


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
        select(Menu).where(Menu.menu_key == DIRECTOR_MENU["menu_key"])
    )
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = DIRECTOR_MENU["menu_title"]
        menu.route_path = DIRECTOR_MENU["route_path"]
        menu.icon = DIRECTOR_MENU["icon"]
        menu.permission_key = DIRECTOR_MENU["permission_key"]
        menu.sort_order = DIRECTOR_MENU["sort_order"]
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER
        print("Menu updated: audit_entity_director")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key=DIRECTOR_MENU["menu_key"],
        menu_title=DIRECTOR_MENU["menu_title"],
        route_path=DIRECTOR_MENU["route_path"],
        icon=DIRECTOR_MENU["icon"],
        permission_key=DIRECTOR_MENU["permission_key"],
        sort_order=DIRECTOR_MENU["sort_order"],
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )
    db.add(menu)
    await db.flush()

    print("Menu created: audit_entity_director")
    return menu


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


async def get_or_create_menu_action(
    db,
    menu_id: int,
    action_data: tuple,
) -> MenuAction:
    action_key, action_title, permission_key, button_color, button_icon, sort_order = action_data

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
        print(f"Menu action updated: {action_key}")
        return action

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
    await db.flush()

    print(f"Menu action created: {action_key}")
    return action


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


async def seed_audit_entity_director_navigation() -> None:
    async with AsyncSessionLocal() as db:
        await seed_director_types(db)

        permission_by_key: dict[str, Permission] = {}

        for permission_data in PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permission_by_key[permission.permission_key] = permission

        group = await get_or_create_audit_group(db)
        menu = await get_or_create_menu(db, group.id)

        await get_or_create_menu_permission(
            db=db,
            menu_id=menu.id,
            permission_id=permission_by_key[DIRECTOR_MENU["permission_key"]].id,
        )

        for action_data in MENU_ACTIONS:
            action = await get_or_create_menu_action(
                db=db,
                menu_id=menu.id,
                action_data=action_data,
            )

            action_permission = permission_by_key[action_data[2]]

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

    print("Audit Entity Director/Owner seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_audit_entity_director_navigation())
