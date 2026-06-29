from datetime import datetime

import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import engine
from app.models.menu import Menu
from app.models.navigation_group import NavigationGroup


SYSTEM_USER = "c23_dynamic_navigation_v2"


def touch_create(instance: object) -> None:
    now = datetime.utcnow()

    if hasattr(instance, "created_by"):
        setattr(instance, "created_by", SYSTEM_USER)
    if hasattr(instance, "updated_by"):
        setattr(instance, "updated_by", SYSTEM_USER)
    if hasattr(instance, "created_at"):
        setattr(instance, "created_at", now)
    if hasattr(instance, "updated_at"):
        setattr(instance, "updated_at", now)


def touch_update(instance: object) -> None:
    now = datetime.utcnow()

    if hasattr(instance, "updated_by"):
        setattr(instance, "updated_by", SYSTEM_USER)
    if hasattr(instance, "updated_at"):
        setattr(instance, "updated_at", now)


async def get_audit_group(db: AsyncSession) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(
            NavigationGroup.group_key == "audit",
            NavigationGroup.is_active == True,
        )
    )
    group = result.scalar_one_or_none()

    if group is None:
        raise RuntimeError("Audit navigation group not found.")

    return group


async def get_menu_by_key(db: AsyncSession, menu_key: str) -> Menu | None:
    result = await db.execute(select(Menu).where(Menu.menu_key == menu_key))
    return result.scalar_one_or_none()


async def upsert_audit_operation_parent(
    db: AsyncSession,
    audit_group_id: int,
) -> Menu:
    menu = await get_menu_by_key(db, "audit_operation")

    if menu is None:
        menu = Menu(
            navigation_group_id=audit_group_id,
            parent_menu_id=None,
            menu_key="audit_operation",
            menu_title="Audit Operation",
            route_path=None,
            icon="FolderKanban",
            permission_key=None,
            sort_order=80,
            menu_level=1,
            is_expandable=True,
            is_visible=False,
            is_active=True,
        )
        touch_create(menu)
        db.add(menu)
        await db.flush()
        print(f"Created hidden parent menu: audit_operation id={menu.id}")
        return menu

    menu.navigation_group_id = audit_group_id
    menu.parent_menu_id = None
    menu.menu_title = "Audit Operation"
    menu.route_path = None
    menu.icon = "FolderKanban"
    menu.permission_key = None
    menu.sort_order = 80
    menu.menu_level = 1
    menu.is_expandable = True
    menu.is_visible = False
    menu.is_active = True
    touch_update(menu)
    await db.flush()
    print(f"Updated hidden parent menu: audit_operation id={menu.id}")
    return menu


async def upsert_child_menu(
    db: AsyncSession,
    audit_group_id: int,
    parent_menu_id: int,
    payload: dict,
) -> Menu:
    menu = await get_menu_by_key(db, payload["menu_key"])

    if menu is None:
        menu = Menu(
            navigation_group_id=audit_group_id,
            parent_menu_id=parent_menu_id,
            menu_key=payload["menu_key"],
            menu_title=payload["menu_title"],
            route_path=payload["route_path"],
            icon=payload["icon"],
            permission_key=payload["permission_key"],
            sort_order=payload["sort_order"],
            menu_level=2,
            is_expandable=False,
            is_visible=False,
            is_active=True,
        )
        touch_create(menu)
        db.add(menu)
        await db.flush()
        print(f"Created hidden child menu: {menu.menu_key} id={menu.id}")
        return menu

    menu.navigation_group_id = audit_group_id
    menu.parent_menu_id = parent_menu_id
    menu.menu_title = payload["menu_title"]
    menu.route_path = payload["route_path"]
    menu.icon = payload["icon"]
    menu.permission_key = payload["permission_key"]
    menu.sort_order = payload["sort_order"]
    menu.menu_level = 2
    menu.is_expandable = False
    menu.is_visible = False
    menu.is_active = True
    touch_update(menu)
    await db.flush()
    print(f"Updated hidden child menu: {menu.menu_key} id={menu.id}")
    return menu


async def main() -> None:
    children = [
        {
            "menu_key": "audit_plan",
            "menu_title": "Audit Plan",
            "route_path": "/audit-plans",
            "icon": "ClipboardList",
            "permission_key": "menu.audit_plan.view",
            "sort_order": 10,
        },
        {
            "menu_key": "audit_entry",
            "menu_title": "Audit Entry",
            "route_path": "/audit-entries",
            "icon": "ClipboardCheck",
            "permission_key": "menu.audit_entry.view",
            "sort_order": 20,
        },
        {
            "menu_key": "audit_schedule",
            "menu_title": "Audit Schedule",
            "route_path": "/audit-schedules",
            "icon": "CalendarDays",
            "permission_key": "menu.audit_schedule.view",
            "sort_order": 30,
        },
    ]

    async with AsyncSession(engine, expire_on_commit=False) as db:
        audit_group = await get_audit_group(db)

        parent = await upsert_audit_operation_parent(
            db=db,
            audit_group_id=audit_group.id,
        )

        for child in children:
            await upsert_child_menu(
                db=db,
                audit_group_id=audit_group.id,
                parent_menu_id=parent.id,
                payload=child,
            )

        await db.commit()

    print("Audit Operation hidden navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(main())
