import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_permission import MenuPermission
from app.models.menu_action_permission import MenuActionPermission
from app.models.permission import Permission


SYSTEM_USER = "system"


def parse_permission_key(permission_key: str) -> dict:
    """
    Example:
    menu.company.view
      -> resource_type = menu
      -> resource_key  = company
      -> action        = view

    button.company.export
      -> resource_type = button
      -> resource_key  = company
      -> action        = export
    """

    parts = permission_key.split(".")

    resource_type = parts[0] if len(parts) >= 1 else "general"
    action = parts[-1] if len(parts) >= 2 else "view"
    resource_key = ".".join(parts[1:-1]) if len(parts) >= 3 else "general"

    return {
        "resource_type": resource_type,
        "resource_key": resource_key,
        "action": action,
    }


async def get_or_create_permission(db, permission_key: str):
    result = await db.execute(
        select(Permission).where(Permission.permission_key == permission_key)
    )
    permission = result.scalar_one_or_none()

    if permission:
        return permission

    parsed = parse_permission_key(permission_key)

    permission = Permission(
        permission_key=permission_key,
        resource_type=parsed["resource_type"],
        resource_key=parsed["resource_key"],
        action=parsed["action"],
        description=permission_key.replace(".", " ").title(),
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission_key}")
    return permission


async def menu_permission_exists(db, menu_id: int, permission_id: int):
    result = await db.execute(
        select(MenuPermission).where(
            MenuPermission.menu_id == menu_id,
            MenuPermission.permission_id == permission_id,
        )
    )
    return result.scalar_one_or_none()


async def action_permission_exists(db, menu_action_id: int, permission_id: int):
    result = await db.execute(
        select(MenuActionPermission).where(
            MenuActionPermission.menu_action_id == menu_action_id,
            MenuActionPermission.permission_id == permission_id,
        )
    )
    return result.scalar_one_or_none()


async def seed_menu_permission_mapping(db):
    result = await db.execute(
        select(Menu).where(
            Menu.permission_key.is_not(None),
            Menu.is_active == True,
        )
    )
    menus = result.scalars().all()

    for menu in menus:
        permission = await get_or_create_permission(db, menu.permission_key)

        existing = await menu_permission_exists(
            db=db,
            menu_id=menu.id,
            permission_id=permission.id,
        )

        if existing:
            continue

        mapping = MenuPermission(
            menu_id=menu.id,
            permission_id=permission.id,
            is_active=True,
            created_by=SYSTEM_USER,
            updated_by=SYSTEM_USER,
        )

        db.add(mapping)
        await db.commit()

        print(
            f"Menu permission mapped: "
            f"{menu.menu_key} -> {permission.permission_key}"
        )


async def seed_menu_action_permission_mapping(db):
    result = await db.execute(
        select(MenuAction).where(
            MenuAction.permission_key.is_not(None),
            MenuAction.is_active == True,
        )
    )
    actions = result.scalars().all()

    for action in actions:
        permission = await get_or_create_permission(db, action.permission_key)

        existing = await action_permission_exists(
            db=db,
            menu_action_id=action.id,
            permission_id=permission.id,
        )

        if existing:
            continue

        mapping = MenuActionPermission(
            menu_action_id=action.id,
            permission_id=permission.id,
            is_active=True,
            created_by=SYSTEM_USER,
            updated_by=SYSTEM_USER,
        )

        db.add(mapping)
        await db.commit()

        print(
            f"Action permission mapped: "
            f"{action.action_key} -> {permission.permission_key}"
        )


async def seed_navigation_permissions():
    async with AsyncSessionLocal() as db:
        await seed_menu_permission_mapping(db)
        await seed_menu_action_permission_mapping(db)

        print("Navigation permission mapping seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_navigation_permissions())