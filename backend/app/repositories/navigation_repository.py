from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.navigation_group import NavigationGroup
from app.models.user import User


class NavigationRepository:
    @staticmethod
    async def get_user_permission_keys(
        db: AsyncSession,
        user_id: int,
    ) -> set[str]:
        result = await db.execute(
            text(
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
            ),
            {"user_id": user_id},
        )

        rows = result.mappings().all()
        return {row["permission_key"] for row in rows if row["permission_key"]}

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
    ) -> list[dict]:
        is_superuser = bool(getattr(current_user, "is_superuser", False))

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
            .order_by(NavigationGroup.sort_order, NavigationGroup.id)
        )
        groups = groups_result.scalars().all()

        menus_result = await db.execute(
            select(Menu)
            .where(
                Menu.is_active == True,
                Menu.is_visible == True,
            )
            .order_by(
                Menu.navigation_group_id,
                Menu.parent_menu_id,
                Menu.sort_order,
                Menu.id,
            )
        )
        menus = menus_result.scalars().all()

        actions_result = await db.execute(
            select(MenuAction)
            .where(
                MenuAction.is_active == True,
                MenuAction.is_visible == True,
            )
            .order_by(MenuAction.menu_id, MenuAction.sort_order, MenuAction.id)
        )
        actions = actions_result.scalars().all()

        actions_by_menu_id: dict[int, list[dict]] = {}

        for action in actions:
            if not NavigationRepository.is_allowed(
                permission_key=action.permission_key,
                allowed_permissions=allowed_permissions,
                is_superuser=is_superuser,
            ):
                continue

            actions_by_menu_id.setdefault(action.menu_id, []).append(
                {
                    "id": action.id,
                    "action_key": action.action_key,
                    "action_title": action.action_title,
                    "permission_key": action.permission_key,
                    "button_color": action.button_color,
                    "button_icon": action.button_icon,
                    "sort_order": action.sort_order,
                }
            )

        menus_by_parent_id: dict[int | None, list[Menu]] = {}

        for menu in menus:
            menus_by_parent_id.setdefault(menu.parent_menu_id, []).append(menu)

        for sibling_menus in menus_by_parent_id.values():
            sibling_menus.sort(key=lambda item: (item.sort_order, item.id))

        def build_menu_tree(parent_menu_id: int | None, group_id: int) -> list[dict]:
            tree: list[dict] = []

            for menu in menus_by_parent_id.get(parent_menu_id, []):
                if parent_menu_id is None and menu.navigation_group_id != group_id:
                    continue

                child_nodes = build_menu_tree(menu.id, group_id)

                self_allowed = NavigationRepository.is_allowed(
                    permission_key=menu.permission_key,
                    allowed_permissions=allowed_permissions,
                    is_superuser=is_superuser,
                )

                if not self_allowed and not child_nodes:
                    continue

                # If a denied parent has allowed children, keep it as a container only.
                safe_route_path = menu.route_path if self_allowed else None
                safe_actions = actions_by_menu_id.get(menu.id, []) if self_allowed else []

                tree.append(
                    {
                        "id": menu.id,
                        "parent_menu_id": menu.parent_menu_id,
                        "menu_key": menu.menu_key,
                        "menu_title": menu.menu_title,
                        "route_path": safe_route_path,
                        "icon": menu.icon,
                        "permission_key": menu.permission_key,
                        "sort_order": menu.sort_order,
                        "menu_level": menu.menu_level,
                        "is_expandable": bool(menu.is_expandable or child_nodes),
                        "actions": safe_actions,
                        "children": child_nodes,
                    }
                )

            return tree

        navigation: list[dict] = []

        for group in groups:
            group_menus = build_menu_tree(parent_menu_id=None, group_id=group.id)

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
