"""seed meeting type navigation permissions

Revision ID: c253a_mt_nav_seed
Revises: c253_meeting_type
Create Date: 2026-07-05
"""

from alembic import op
import sqlalchemy as sa


revision = "c253a_mt_nav_seed"
down_revision = "c253_meeting_type"
branch_labels = None
depends_on = None


SEED_BY = "c25_3_meeting_type_navigation_seed"


permissions = sa.table(
    "permissions",
    sa.column("id", sa.Integer),
    sa.column("permission_key", sa.String),
    sa.column("resource_type", sa.String),
    sa.column("resource_key", sa.String),
    sa.column("action", sa.String),
    sa.column("description", sa.Text),
    sa.column("is_active", sa.Boolean),
    sa.column("created_by", sa.String),
    sa.column("updated_by", sa.String),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
)

menus = sa.table(
    "menus",
    sa.column("id", sa.Integer),
    sa.column("navigation_group_id", sa.Integer),
    sa.column("parent_menu_id", sa.Integer),
    sa.column("menu_key", sa.String),
    sa.column("menu_title", sa.String),
    sa.column("route_path", sa.String),
    sa.column("icon", sa.String),
    sa.column("permission_key", sa.String),
    sa.column("sort_order", sa.Integer),
    sa.column("menu_level", sa.Integer),
    sa.column("is_expandable", sa.Boolean),
    sa.column("is_visible", sa.Boolean),
    sa.column("is_active", sa.Boolean),
    sa.column("created_by", sa.String),
    sa.column("updated_by", sa.String),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
)

menu_permissions = sa.table(
    "menu_permissions",
    sa.column("id", sa.Integer),
    sa.column("menu_id", sa.Integer),
    sa.column("permission_id", sa.Integer),
    sa.column("is_active", sa.Boolean),
    sa.column("created_by", sa.String),
    sa.column("updated_by", sa.String),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
)

menu_actions = sa.table(
    "menu_actions",
    sa.column("id", sa.Integer),
    sa.column("menu_id", sa.Integer),
    sa.column("action_key", sa.String),
    sa.column("action_title", sa.String),
    sa.column("permission_key", sa.String),
    sa.column("button_color", sa.String),
    sa.column("button_icon", sa.String),
    sa.column("sort_order", sa.Integer),
    sa.column("is_visible", sa.Boolean),
    sa.column("is_active", sa.Boolean),
    sa.column("created_by", sa.String),
    sa.column("updated_by", sa.String),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
)

role_permissions = sa.table(
    "role_permissions",
    sa.column("id", sa.Integer),
    sa.column("role_id", sa.Integer),
    sa.column("permission_id", sa.Integer),
    sa.column("is_active", sa.Boolean),
    sa.column("created_by", sa.String),
    sa.column("updated_by", sa.String),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
)


PERMISSION_ROWS = [
    ("menu.meeting_type.view", "menu", "meeting_type", "view", "View Meeting Type menu and page."),
    ("api.meeting_type.view", "api", "meeting_type", "view", "View records. Meeting Type"),
    ("api.meeting_type.create", "api", "meeting_type", "create", "Create records. Meeting Type"),
    ("api.meeting_type.update", "api", "meeting_type", "update", "Update records. Meeting Type"),
    ("api.meeting_type.delete", "api", "meeting_type", "delete", "Deactivate records. Meeting Type"),
    ("api.meeting_type.restore", "api", "meeting_type", "restore", "Restore inactive records. Meeting Type"),
    ("api.meeting_type.permanent_delete", "api", "meeting_type", "permanent_delete", "Permanently delete records. Meeting Type"),
    ("button.meeting_type.view", "button", "meeting_type", "view", "Show view action. Meeting Type"),
    ("button.meeting_type.create", "button", "meeting_type", "create", "Show create button. Meeting Type"),
    ("button.meeting_type.update", "button", "meeting_type", "update", "Show update button. Meeting Type"),
    ("button.meeting_type.delete", "button", "meeting_type", "delete", "Show inactive/delete button. Meeting Type"),
    ("button.meeting_type.restore", "button", "meeting_type", "restore", "Show restore button. Meeting Type"),
    ("button.meeting_type.permanent_delete", "button", "meeting_type", "permanent_delete", "Show permanent delete button. Meeting Type"),
    ("button.meeting_type.export", "button", "meeting_type", "export", "Show export button. Meeting Type"),
    ("button.meeting_type.import", "button", "meeting_type", "import", "Show import button. Meeting Type"),
]

ACTION_ROWS = [
    ("create", "Create", "button.meeting_type.create", "blue", "Plus", 10),
    ("update", "Edit", "button.meeting_type.update", "amber", "Pencil", 20),
    ("delete", "Inactive", "button.meeting_type.delete", "red", "Trash2", 30),
    ("restore", "Restore", "button.meeting_type.restore", "green", "RotateCcw", 40),
    ("permanent_delete", "Permanent Delete", "button.meeting_type.permanent_delete", "red", "AlertTriangle", 50),
    ("export", "Export", "button.meeting_type.export", "slate", "Download", 60),
    ("import", "Import", "button.meeting_type.import", "slate", "Upload", 70),
]


def _scalar(bind, statement):
    return bind.execute(statement).scalar_one_or_none()


def upgrade() -> None:
    bind = op.get_bind()

    for permission_key, resource_type, resource_key, action, description in PERMISSION_ROWS:
        existing_id = _scalar(
            bind,
            sa.select(permissions.c.id).where(
                permissions.c.permission_key == permission_key
            ),
        )

        if existing_id is None:
            bind.execute(
                permissions.insert().values(
                    permission_key=permission_key,
                    resource_type=resource_type,
                    resource_key=resource_key,
                    action=action,
                    description=description,
                    is_active=True,
                    created_by=SEED_BY,
                    updated_by=SEED_BY,
                    created_at=sa.func.now(),
                    updated_at=sa.func.now(),
                )
            )
        else:
            bind.execute(
                permissions.update()
                .where(permissions.c.id == existing_id)
                .values(
                    resource_type=resource_type,
                    resource_key=resource_key,
                    action=action,
                    description=description,
                    is_active=True,
                    updated_by=SEED_BY,
                    updated_at=sa.func.now(),
                )
            )

    meeting_type_menu_id = _scalar(
        bind,
        sa.select(menus.c.id).where(
            sa.or_(
                menus.c.menu_key == "meeting_type",
                menus.c.route_path == "/audit-meetings/types",
            )
        ),
    )

    if meeting_type_menu_id is None:
        bind.execute(
            menus.insert().values(
                navigation_group_id=8,
                parent_menu_id=31,
                menu_key="meeting_type",
                menu_title="Meeting Type",
                route_path="/audit-meetings/types",
                icon="Tags",
                permission_key="menu.meeting_type.view",
                sort_order=15,
                menu_level=3,
                is_expandable=False,
                is_visible=True,
                is_active=True,
                created_by=SEED_BY,
                updated_by=SEED_BY,
                created_at=sa.func.now(),
                updated_at=sa.func.now(),
            )
        )
        meeting_type_menu_id = _scalar(
            bind,
            sa.select(menus.c.id).where(menus.c.menu_key == "meeting_type"),
        )
    else:
        bind.execute(
            menus.update()
            .where(menus.c.id == meeting_type_menu_id)
            .values(
                navigation_group_id=8,
                parent_menu_id=31,
                menu_title="Meeting Type",
                route_path="/audit-meetings/types",
                icon="Tags",
                permission_key="menu.meeting_type.view",
                sort_order=15,
                menu_level=3,
                is_expandable=False,
                is_visible=True,
                is_active=True,
                updated_by=SEED_BY,
                updated_at=sa.func.now(),
            )
        )

    menu_view_permission_id = _scalar(
        bind,
        sa.select(permissions.c.id).where(
            permissions.c.permission_key == "menu.meeting_type.view"
        ),
    )

    existing_menu_permission_id = _scalar(
        bind,
        sa.select(menu_permissions.c.id).where(
            sa.and_(
                menu_permissions.c.menu_id == meeting_type_menu_id,
                menu_permissions.c.permission_id == menu_view_permission_id,
            )
        ),
    )

    if existing_menu_permission_id is None:
        bind.execute(
            menu_permissions.insert().values(
                menu_id=meeting_type_menu_id,
                permission_id=menu_view_permission_id,
                is_active=True,
                created_by=SEED_BY,
                updated_by=SEED_BY,
                created_at=sa.func.now(),
                updated_at=sa.func.now(),
            )
        )
    else:
        bind.execute(
            menu_permissions.update()
            .where(menu_permissions.c.id == existing_menu_permission_id)
            .values(
                is_active=True,
                updated_by=SEED_BY,
                updated_at=sa.func.now(),
            )
        )

    for action_key, action_title, permission_key, button_color, button_icon, sort_order in ACTION_ROWS:
        existing_action_id = _scalar(
            bind,
            sa.select(menu_actions.c.id).where(
                sa.and_(
                    menu_actions.c.menu_id == meeting_type_menu_id,
                    menu_actions.c.action_key == action_key,
                )
            ),
        )

        if existing_action_id is None:
            bind.execute(
                menu_actions.insert().values(
                    menu_id=meeting_type_menu_id,
                    action_key=action_key,
                    action_title=action_title,
                    permission_key=permission_key,
                    button_color=button_color,
                    button_icon=button_icon,
                    sort_order=sort_order,
                    is_visible=True,
                    is_active=True,
                    created_by=SEED_BY,
                    updated_by=SEED_BY,
                    created_at=sa.func.now(),
                    updated_at=sa.func.now(),
                )
            )
        else:
            bind.execute(
                menu_actions.update()
                .where(menu_actions.c.id == existing_action_id)
                .values(
                    action_title=action_title,
                    permission_key=permission_key,
                    button_color=button_color,
                    button_icon=button_icon,
                    sort_order=sort_order,
                    is_visible=True,
                    is_active=True,
                    updated_by=SEED_BY,
                    updated_at=sa.func.now(),
                )
            )

    permission_ids = bind.execute(
        sa.select(permissions.c.id).where(permissions.c.resource_key == "meeting_type")
    ).scalars().all()

    for permission_id in permission_ids:
        existing_role_permission_id = _scalar(
            bind,
            sa.select(role_permissions.c.id).where(
                sa.and_(
                    role_permissions.c.role_id == 1,
                    role_permissions.c.permission_id == permission_id,
                )
            ),
        )

        if existing_role_permission_id is None:
            bind.execute(
                role_permissions.insert().values(
                    role_id=1,
                    permission_id=permission_id,
                    is_active=True,
                    created_by=SEED_BY,
                    updated_by=SEED_BY,
                    created_at=sa.func.now(),
                    updated_at=sa.func.now(),
                )
            )
        else:
            bind.execute(
                role_permissions.update()
                .where(role_permissions.c.id == existing_role_permission_id)
                .values(
                    is_active=True,
                    updated_by=SEED_BY,
                    updated_at=sa.func.now(),
                )
            )


def downgrade() -> None:
    bind = op.get_bind()

    permission_ids = bind.execute(
        sa.select(permissions.c.id).where(permissions.c.resource_key == "meeting_type")
    ).scalars().all()

    menu_ids = bind.execute(
        sa.select(menus.c.id).where(
            sa.or_(
                menus.c.menu_key == "meeting_type",
                menus.c.route_path == "/audit-meetings/types",
            )
        )
    ).scalars().all()

    if permission_ids:
        bind.execute(
            role_permissions.delete().where(
                role_permissions.c.permission_id.in_(permission_ids)
            )
        )

    if menu_ids:
        bind.execute(
            menu_actions.delete().where(menu_actions.c.menu_id.in_(menu_ids))
        )
        bind.execute(
            menu_permissions.delete().where(menu_permissions.c.menu_id.in_(menu_ids))
        )
        bind.execute(menus.delete().where(menus.c.id.in_(menu_ids)))

    if permission_ids:
        bind.execute(permissions.delete().where(permissions.c.id.in_(permission_ids)))

