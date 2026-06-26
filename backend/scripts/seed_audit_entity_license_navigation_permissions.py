import asyncio

from sqlalchemy import func, select

from app.db.session import AsyncSessionLocal
from app.models.audit_entity_license import AuditEntityLicenseType
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission
from app.models.menu_permission import MenuPermission
from app.models.navigation_group import NavigationGroup
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


LICENSE_TYPES = [
    ("001", "Trade License", "City corporation or municipality trade license."),
    ("002", "BIN / VAT Registration", "Business Identification Number or VAT registration."),
    ("003", "TIN / eTIN", "Tax Identification Number."),
    ("004", "RJSC Registration", "RJSC incorporation or registration certificate."),
    ("005", "IRC", "Import Registration Certificate."),
    ("006", "ERC", "Export Registration Certificate."),
    ("007", "Fire License", "Fire service and civil defence license."),
    ("008", "Environment Clearance", "Department of Environment clearance certificate."),
    ("009", "Factory License", "Factory or establishment license."),
    ("010", "BIDA Registration", "BIDA registration or approval."),
    ("011", "NGOAB Registration", "NGO Affairs Bureau registration."),
    ("012", "MRA License", "Microcredit Regulatory Authority license."),
    ("013", "Other Regulatory License", "Any other regulatory license or approval."),
]


AUDIT_GROUP = {
    "group_key": "audit",
    "group_title": "Audit",
    "group_icon": "ClipboardCheck",
    "sort_order": 30,
}


LICENSE_MENU = {
    "menu_key": "audit_entity_license",
    "menu_title": "Entity Licenses",
    "route_path": "/audit-entity-licenses",
    "icon": "FileText",
    "permission_key": "menu.audit_entity_license.view",
    "sort_order": 55,
}


PERMISSIONS = [
    {
        "permission_key": "menu.audit_entity_license.view",
        "resource_type": "menu",
        "resource_key": "audit_entity_license",
        "action": "view",
        "description": "View audit entity license page.",
    },
    {
        "permission_key": "api.audit_entity_license.create",
        "resource_type": "api",
        "resource_key": "audit_entity_license",
        "action": "create",
        "description": "Create audit entity license.",
    },
    {
        "permission_key": "api.audit_entity_license.update",
        "resource_type": "api",
        "resource_key": "audit_entity_license",
        "action": "update",
        "description": "Update audit entity license.",
    },
    {
        "permission_key": "api.audit_entity_license.delete",
        "resource_type": "api",
        "resource_key": "audit_entity_license",
        "action": "delete",
        "description": "Deactivate audit entity license.",
    },
    {
        "permission_key": "api.audit_entity_license.restore",
        "resource_type": "api",
        "resource_key": "audit_entity_license",
        "action": "restore",
        "description": "Restore audit entity license.",
    },
    {
        "permission_key": "api.audit_entity_license.permanent_delete",
        "resource_type": "api",
        "resource_key": "audit_entity_license",
        "action": "permanent_delete",
        "description": "Permanently delete audit entity license.",
    },
    {
        "permission_key": "button.audit_entity_license.create",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "create",
        "description": "Show create license button.",
    },
    {
        "permission_key": "button.audit_entity_license.update",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "update",
        "description": "Show update license button.",
    },
    {
        "permission_key": "button.audit_entity_license.inactive",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "inactive",
        "description": "Show inactive license button.",
    },
    {
        "permission_key": "button.audit_entity_license.delete",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "delete",
        "description": "Show delete license button.",
    },
    {
        "permission_key": "button.audit_entity_license.restore",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "restore",
        "description": "Show restore license button.",
    },
    {
        "permission_key": "button.audit_entity_license.permanent_delete",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "permanent_delete",
        "description": "Show permanent delete license button.",
    },
    {
        "permission_key": "button.audit_entity_license.export",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "export",
        "description": "Show export license button.",
    },
    {
        "permission_key": "button.audit_entity_license.import",
        "resource_type": "button",
        "resource_key": "audit_entity_license",
        "action": "import",
        "description": "Show import license button.",
    },
]


MENU_ACTIONS = [
    ("create", "Create", "button.audit_entity_license.create", "green", "Plus", 10),
    ("update", "Update", "button.audit_entity_license.update", "blue", "Pencil", 20),
    ("inactive", "Inactive", "button.audit_entity_license.inactive", "red", "Trash2", 30),
    ("delete", "Delete", "button.audit_entity_license.delete", "red", "Trash2", 35),
    ("restore", "Restore", "button.audit_entity_license.restore", "green", "RotateCcw", 40),
    (
        "permanent_delete",
        "Permanent Delete",
        "button.audit_entity_license.permanent_delete",
        "red",
        "AlertTriangle",
        50,
    ),
    ("export", "Export", "button.audit_entity_license.export", "slate", "Download", 60),
    ("import", "Import", "button.audit_entity_license.import", "slate", "Upload", 70),
]


async def seed_license_types(db) -> None:
    for code, name, description in LICENSE_TYPES:
        result = await db.execute(
            select(AuditEntityLicenseType).where(
                AuditEntityLicenseType.license_type_code == code
            )
        )
        license_type = result.scalar_one_or_none()

        if license_type:
            license_type.license_type_name = name
            license_type.description = description
            license_type.is_active = True
            license_type.updated_by = SYSTEM_USER
            print(f"License type updated: {code} - {name}")
            continue

        license_type = AuditEntityLicenseType(
            license_type_code=code,
            license_type_name=name,
            description=description,
            is_active=True,
            created_by=SYSTEM_USER,
            updated_by=SYSTEM_USER,
        )
        db.add(license_type)
        await db.flush()

        print(f"License type created: {code} - {name}")


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
        select(Menu).where(Menu.menu_key == LICENSE_MENU["menu_key"])
    )
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = LICENSE_MENU["menu_title"]
        menu.route_path = LICENSE_MENU["route_path"]
        menu.icon = LICENSE_MENU["icon"]
        menu.permission_key = LICENSE_MENU["permission_key"]
        menu.sort_order = LICENSE_MENU["sort_order"]
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER
        print("Menu updated: audit_entity_license")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key=LICENSE_MENU["menu_key"],
        menu_title=LICENSE_MENU["menu_title"],
        route_path=LICENSE_MENU["route_path"],
        icon=LICENSE_MENU["icon"],
        permission_key=LICENSE_MENU["permission_key"],
        sort_order=LICENSE_MENU["sort_order"],
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )
    db.add(menu)
    await db.flush()

    print("Menu created: audit_entity_license")
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


async def seed_audit_entity_license_navigation() -> None:
    async with AsyncSessionLocal() as db:
        await seed_license_types(db)

        permission_by_key: dict[str, Permission] = {}

        for permission_data in PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permission_by_key[permission.permission_key] = permission

        group = await get_or_create_audit_group(db)
        menu = await get_or_create_menu(db, group.id)

        await get_or_create_menu_permission(
            db=db,
            menu_id=menu.id,
            permission_id=permission_by_key[LICENSE_MENU["permission_key"]].id,
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

    print("Audit Entity License seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_audit_entity_license_navigation())
