from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.navigation_group import NavigationGroup
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.user import User


class NavigationRepository:
    @staticmethod
    async def get_user_permission_keys(
        db: AsyncSession,
        user_id: int,
    ) -> set[str]:
        query = text(
            """
            SELECT DISTINCT p.permission_key
            FROM permissions p
            INNER JOIN role_permissions rp
                ON rp.permission_id = p.id
                AND rp.is_active = true
            INNER JOIN user_roles ur
                ON ur.role_id = rp.role_id
                AND ur.is_active = true
            WHERE ur.user_id = :user_id
              AND p.is_active = true
            """
        )

        result = await db.execute(query, {"user_id": user_id})
        rows = result.fetchall()

        return {row.permission_key for row in rows}

    @staticmethod
    def is_allowed(
        permission_key: str | None,
        allowed_permissions: set[str],
        is_superuser: bool,
    ) -> bool:
        if is_superuser:
            return True

        if permission_key is None:
            return True

        return permission_key in allowed_permissions

    @staticmethod
    async def get_navigation(
        db: AsyncSession,
        current_user: User,
    ):
        is_superuser = bool(current_user.is_superuser)

        allowed_permissions: set[str] = set()

        if not is_superuser:
            allowed_permissions = await NavigationRepository.get_user_permission_keys(
                db=db,
                user_id=current_user.id,
            )

        groups_result = await db.execute(
            select(NavigationGroup)
            .where(
                NavigationGroup.is_active == True,
                NavigationGroup.is_visible == True,
            )
            .order_by(NavigationGroup.sort_order)
        )

        groups = groups_result.scalars().all()

        menus_result = await db.execute(
            select(Menu)
            .where(
                Menu.is_active == True,
                Menu.is_visible == True,
            )
            .order_by(Menu.sort_order)
        )

        menus = menus_result.scalars().all()

        actions_result = await db.execute(
            select(MenuAction)
            .where(
                MenuAction.is_active == True,
                MenuAction.is_visible == True,
            )
            .order_by(MenuAction.sort_order)
        )

        actions = actions_result.scalars().all()

        actions_by_menu_id: dict[int, list[MenuAction]] = {}

        for action in actions:
            if not NavigationRepository.is_allowed(
                permission_key=action.permission_key,
                allowed_permissions=allowed_permissions,
                is_superuser=is_superuser,
            ):
                continue

            actions_by_menu_id.setdefault(action.menu_id, []).append(action)

        menus_by_group_id: dict[int, list[dict]] = {}

        for menu in menus:
            if not NavigationRepository.is_allowed(
                permission_key=menu.permission_key,
                allowed_permissions=allowed_permissions,
                is_superuser=is_superuser,
            ):
                continue

            menu_actions = actions_by_menu_id.get(menu.id, [])

            menu_data = {
                "id": menu.id,
                "menu_key": menu.menu_key,
                "menu_title": menu.menu_title,
                "route_path": menu.route_path,
                "icon": menu.icon,
                "permission_key": menu.permission_key,
                "sort_order": menu.sort_order,
                "actions": [
                    {
                        "id": action.id,
                        "action_key": action.action_key,
                        "action_title": action.action_title,
                        "permission_key": action.permission_key,
                        "button_color": action.button_color,
                        "button_icon": action.button_icon,
                        "sort_order": action.sort_order,
                    }
                    for action in menu_actions
                ],
            }

            if menu.navigation_group_id is not None:
                menus_by_group_id.setdefault(menu.navigation_group_id, []).append(
                    menu_data
                )

        navigation = []

        for group in groups:
            group_menus = menus_by_group_id.get(group.id, [])

            if not group_menus:
                continue

            navigation.append(
                {
                    "id": group.id,
                    "group_key": group.group_key,
                    "group_title": group.group_title,
                    "group_icon": group.group_icon,
                    "group_badge": group.group_badge,
                    "group_color": group.group_color,
                    "sort_order": group.sort_order,
                    "menus": group_menus,
                }
            )

        return navigation