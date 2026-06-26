# E:\Audit\AMS\backend\scripts\seed_navigation_group_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


NAVIGATION_GROUP_PERMISSIONS = [
    {
        "permission_key": "menu.navigation_group.view",
        "resource_type": "menu",
        "resource_key": "navigation_group",
        "action": "view",
        "description": "Can view navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.create",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "create",
        "description": "Can create navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.update",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "update",
        "description": "Can update navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.delete",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "delete",
        "description": "Can deactivate navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.restore",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "restore",
        "description": "Can restore navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.permanent_delete",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "permanent_delete",
        "description": "Can permanently delete navigation groups.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.role.view",
    "api.role.create",
    "menu.permission.view",
    "api.permission.create",
    "menu.user.view",
    "api.user.create",
    "menu.user_role.view",
    "api.user_role.assign",
    "menu.role_permission.view",
    "api.role_permission.assign",
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


async def seed_navigation_group_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in NAVIGATION_GROUP_PERMISSIONS:
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

        print("Navigation group permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_navigation_group_permissions())