# E:\Audit\AMS\backend\scripts\seed_menu_permission_mapping_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


MENU_PERMISSION_MAPPING_PERMISSIONS = [
    {
        "permission_key": "menu.menu_permission.view",
        "resource_type": "menu",
        "resource_key": "menu_permission",
        "action": "view",
        "description": "Can view menu permission mappings.",
    },
    {
        "permission_key": "api.menu_permission.assign",
        "resource_type": "api",
        "resource_key": "menu_permission",
        "action": "assign",
        "description": "Can assign permissions to menus.",
    },
    {
        "permission_key": "api.menu_permission.remove",
        "resource_type": "api",
        "resource_key": "menu_permission",
        "action": "remove",
        "description": "Can remove permissions from menus.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.menu.view",
    "api.menu.create",
    "menu.menu_action.view",
    "api.menu_action.create",
    "menu.navigation_group.view",
    "api.navigation_group.create",
    "menu.role.view",
    "api.role.create",
    "menu.permission.view",
    "api.permission.create",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
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
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(db, role_id: int, permission_id: int) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )

        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_menu_permission_mapping_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in MENU_PERMISSION_MAPPING_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("Menu permission mapping permissions seed completed.")

if __name__ == "__main__":
    asyncio.run(seed_menu_permission_mapping_permissions())