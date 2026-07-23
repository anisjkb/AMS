"""add audit acceptance procedures

Revision ID: cf6eaefed27e
Revises: c264exitworkflowrbac
Create Date: 2026-07-22 23:44:32.125150
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "cf6eaefed27e"
down_revision: Union[str, Sequence[str], None] = "c264exitworkflowrbac"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


PERMISSION_KEYS = (
    "menu.audit_accept_proce.view",
    "api.audit_accept_proce.view",
    "api.audit_accept_proce.update",
)


def upgrade() -> None:
    """Create audit acceptance procedure tables and API permissions."""

    op.create_table(
        "audit_accept_templates",
        sa.Column(
            "template_id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "template_key",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "template_name",
            sa.String(length=200),
            nullable=False,
        ),
        sa.Column(
            "reference_no",
            sa.String(length=50),
            nullable=True,
        ),
        sa.Column(
            "version",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "intro_text",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "effective_from",
            sa.Date(),
            nullable=True,
        ),
        sa.Column(
            "effective_to",
            sa.Date(),
            nullable=True,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "created_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "updated_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            """
            effective_to IS NULL
            OR effective_from IS NULL
            OR effective_to >= effective_from
            """,
            name="ck_audit_accept_templates_effective_dates",
        ),
        sa.UniqueConstraint(
            "template_key",
            "version",
            name="uq_audit_accept_templates_key_version",
        ),
    )

    op.create_index(
        "ix_audit_accept_templates_is_active",
        "audit_accept_templates",
        ["is_active"],
        unique=False,
    )

    op.create_table(
        "audit_accept_items",
        sa.Column(
            "item_id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "template_id",
            sa.Integer(),
            sa.ForeignKey(
                "audit_accept_templates.template_id",
                ondelete="RESTRICT",
            ),
            nullable=False,
        ),
        sa.Column(
            "parent_item_id",
            sa.Integer(),
            sa.ForeignKey(
                "audit_accept_items.item_id",
                ondelete="RESTRICT",
            ),
            nullable=True,
        ),
        sa.Column(
            "item_type",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "item_key",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "item_no",
            sa.String(length=30),
            nullable=True,
        ),
        sa.Column(
            "title",
            sa.String(length=300),
            nullable=True,
        ),
        sa.Column(
            "content",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "response_type",
            sa.String(length=20),
            server_default=sa.text("'none'"),
            nullable=False,
        ),
        sa.Column(
            "sort_order",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "is_required",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "created_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "updated_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            """
            item_type IN
            (
                'section',
                'question',
                'note',
                'safeguard',
                'conclusion',
                'signature'
            )
            """,
            name="ck_audit_accept_items_item_type",
        ),
        sa.CheckConstraint(
            "response_type IN ('none', 'yes_no')",
            name="ck_audit_accept_items_response_type",
        ),
        sa.CheckConstraint(
            "sort_order >= 0",
            name="ck_audit_accept_items_sort_order",
        ),
        sa.UniqueConstraint(
            "template_id",
            "item_key",
            name="uq_audit_accept_items_template_key",
        ),
    )

    op.create_index(
        "ix_audit_accept_items_template_id",
        "audit_accept_items",
        ["template_id"],
        unique=False,
    )

    op.create_index(
        "ix_audit_accept_items_parent_item_id",
        "audit_accept_items",
        ["parent_item_id"],
        unique=False,
    )

    op.create_index(
        "ix_audit_accept_items_template_sort",
        "audit_accept_items",
        ["template_id", "sort_order"],
        unique=False,
    )

    op.create_index(
        "ix_audit_accept_items_template_type_active",
        "audit_accept_items",
        ["template_id", "item_type", "is_active"],
        unique=False,
    )

    op.create_table(
        "audit_accept_responses",
        sa.Column(
            "response_id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "audit_id",
            sa.Integer(),
            sa.ForeignKey(
                "audit_master.audit_id",
                ondelete="RESTRICT",
            ),
            nullable=False,
        ),
        sa.Column(
            "template_id",
            sa.Integer(),
            sa.ForeignKey(
                "audit_accept_templates.template_id",
                ondelete="RESTRICT",
            ),
            nullable=False,
        ),
        sa.Column(
            "item_id",
            sa.Integer(),
            sa.ForeignKey(
                "audit_accept_items.item_id",
                ondelete="RESTRICT",
            ),
            nullable=False,
        ),
        sa.Column(
            "answer_value",
            sa.String(length=10),
            nullable=True,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "created_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "updated_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            """
            answer_value IS NULL
            OR answer_value IN ('yes', 'no')
            """,
            name="ck_audit_accept_responses_answer_value",
        ),
        sa.UniqueConstraint(
            "audit_id",
            "template_id",
            "item_id",
            name="uq_audit_accept_responses_audit_template_item",
        ),
    )

    op.create_index(
        "ix_audit_accept_responses_audit_id",
        "audit_accept_responses",
        ["audit_id"],
        unique=False,
    )

    op.create_index(
        "ix_audit_accept_responses_template_id",
        "audit_accept_responses",
        ["template_id"],
        unique=False,
    )

    op.create_index(
        "ix_audit_accept_responses_item_id",
        "audit_accept_responses",
        ["item_id"],
        unique=False,
    )

    op.create_index(
        "ix_audit_accept_responses_audit_template",
        "audit_accept_responses",
        ["audit_id", "template_id"],
        unique=False,
    )

    conn = op.get_bind()

    permissions = (
        (
            "menu.audit_accept_proce.view",
            "menu",
            "audit_accept_proce",
            "view",
            "View Audit Acceptance Procedures menu and page.",
        ),
        (
            "api.audit_accept_proce.view",
            "api",
            "audit_accept_proce",
            "view",
            "View Audit Acceptance Procedures.",
        ),
        (
            "api.audit_accept_proce.update",
            "api",
            "audit_accept_proce",
            "update",
            "Save Audit Acceptance Procedure responses.",
        ),
    )

    for key, resource_type, resource_key, action, description in permissions:
        conn.execute(
            sa.text(
                """
                INSERT INTO permissions
                (
                    permission_key,
                    resource_type,
                    resource_key,
                    action,
                    description,
                    is_active,
                    created_at,
                    updated_at
                )
                VALUES
                (
                    :key,
                    :resource_type,
                    :resource_key,
                    :action,
                    :description,
                    true,
                    now(),
                    now()
                )
                ON CONFLICT (permission_key)
                DO UPDATE SET
                    resource_type = EXCLUDED.resource_type,
                    resource_key = EXCLUDED.resource_key,
                    action = EXCLUDED.action,
                    description = EXCLUDED.description,
                    is_active = true,
                    updated_at = now()
                """
            ),
            {
                "key": key,
                "resource_type": resource_type,
                "resource_key": resource_key,
                "action": action,
                "description": description,
            },
        )


    navigation_group_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM navigation_groups
            WHERE group_key = 'audit'
            LIMIT 1
            """
        )
    ).scalar()

    if navigation_group_id is None:
        raise RuntimeError(
            "Audit navigation group was not found."
        )

    parent_menu_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM menus
            WHERE menu_key = 'audit_planning_overview'
            LIMIT 1
            """
        )
    ).scalar()

    if parent_menu_id is None:
        raise RuntimeError(
            "Audit Planning Overview parent menu was not found."
        )

    menu_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM menus
            WHERE menu_key = 'audit_accept_proce'
            LIMIT 1
            """
        )
    ).scalar()

    menu_values = {
        "navigation_group_id": navigation_group_id,
        "parent_menu_id": parent_menu_id,
        "menu_title": "Acceptance Procedures",
        "route_path": "/audit-planning/audit-accept-proce",
        "icon": "UserCheck",
        "permission_key": "menu.audit_accept_proce.view",
        "sort_order": 30,
        "menu_level": 3,
        "seed_by": "migration:cf6eaefed27e",
    }

    if menu_id is None:
        menu_id = conn.execute(
            sa.text(
                """
                INSERT INTO menus
                (
                    navigation_group_id,
                    parent_menu_id,
                    menu_key,
                    menu_title,
                    route_path,
                    icon,
                    permission_key,
                    sort_order,
                    menu_level,
                    is_expandable,
                    is_visible,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                VALUES
                (
                    :navigation_group_id,
                    :parent_menu_id,
                    'audit_accept_proce',
                    :menu_title,
                    :route_path,
                    :icon,
                    :permission_key,
                    :sort_order,
                    :menu_level,
                    false,
                    true,
                    true,
                    :seed_by,
                    :seed_by,
                    now(),
                    now()
                )
                RETURNING id
                """
            ),
            menu_values,
        ).scalar()

        if menu_id is None:
            raise RuntimeError(
                "Acceptance Procedures menu could not be created."
            )
    else:
        conn.execute(
            sa.text(
                """
                UPDATE menus
                SET
                    navigation_group_id = :navigation_group_id,
                    parent_menu_id = :parent_menu_id,
                    menu_title = :menu_title,
                    route_path = :route_path,
                    icon = :icon,
                    permission_key = :permission_key,
                    sort_order = :sort_order,
                    menu_level = :menu_level,
                    is_expandable = false,
                    is_visible = true,
                    is_active = true,
                    updated_by = :seed_by,
                    updated_at = now()
                WHERE id = :menu_id
                """
            ),
            {
                **menu_values,
                "menu_id": menu_id,
            },
        )

    menu_view_permission_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM permissions
            WHERE permission_key =
                'menu.audit_accept_proce.view'
            LIMIT 1
            """
        )
    ).scalar()

    if menu_view_permission_id is None:
        raise RuntimeError(
            "Acceptance Procedures menu permission was not found."
        )

    menu_permission_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM menu_permissions
            WHERE
                menu_id = :menu_id
                AND permission_id = :permission_id
            LIMIT 1
            """
        ),
        {
            "menu_id": menu_id,
            "permission_id": menu_view_permission_id,
        },
    ).scalar()

    if menu_permission_id is None:
        conn.execute(
            sa.text(
                """
                INSERT INTO menu_permissions
                (
                    menu_id,
                    permission_id,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                VALUES
                (
                    :menu_id,
                    :permission_id,
                    true,
                    :seed_by,
                    :seed_by,
                    now(),
                    now()
                )
                """
            ),
            {
                "menu_id": menu_id,
                "permission_id": menu_view_permission_id,
                "seed_by": "migration:cf6eaefed27e",
            },
        )
    else:
        conn.execute(
            sa.text(
                """
                UPDATE menu_permissions
                SET
                    is_active = true,
                    updated_by = :seed_by,
                    updated_at = now()
                WHERE id = :menu_permission_id
                """
            ),
            {
                "menu_permission_id": menu_permission_id,
                "seed_by": "migration:cf6eaefed27e",
            },
        )

    super_admin_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM roles
            WHERE role_name = 'Super Admin'
            LIMIT 1
            """
        )
    ).scalar()

    if super_admin_id is not None:
        for permission_key in PERMISSION_KEYS:
            permission_id = conn.execute(
                sa.text(
                    """
                    SELECT id
                    FROM permissions
                    WHERE permission_key = :permission_key
                    LIMIT 1
                    """
                ),
                {"permission_key": permission_key},
            ).scalar()

            if permission_id is not None:
                conn.execute(
                    sa.text(
                        """
                        INSERT INTO role_permissions
                        (
                            role_id,
                            permission_id,
                            is_active,
                            created_at,
                            updated_at
                        )
                        VALUES
                        (
                            :role_id,
                            :permission_id,
                            true,
                            now(),
                            now()
                        )
                        ON CONFLICT (role_id, permission_id)
                        DO UPDATE SET
                            is_active = true,
                            updated_at = now()
                        """
                    ),
                    {
                        "role_id": super_admin_id,
                        "permission_id": permission_id,
                    },
                )


def downgrade() -> None:
    """Remove audit acceptance procedure tables and API permissions."""

    conn = op.get_bind()


    conn.execute(
        sa.text(
            """
            DELETE FROM menu_permissions
            WHERE
                menu_id IN
                (
                    SELECT id
                    FROM menus
                    WHERE menu_key = 'audit_accept_proce'
                )
                AND permission_id IN
                (
                    SELECT id
                    FROM permissions
                    WHERE permission_key =
                        'menu.audit_accept_proce.view'
                )
            """
        )
    )

    conn.execute(
        sa.text(
            """
            UPDATE menus
            SET
                permission_key = NULL,
                is_visible = false,
                is_active = false,
                updated_by = 'migration:cf6eaefed27e',
                updated_at = now()
            WHERE menu_key = 'audit_accept_proce'
            """
        )
    )

    conn.execute(
        sa.text(
            """
            DELETE FROM role_permissions
            WHERE permission_id IN
            (
                SELECT id
                FROM permissions
                WHERE permission_key IN
                (
                    'menu.audit_accept_proce.view',
                    'api.audit_accept_proce.view',
                    'api.audit_accept_proce.update'
                )
            )
            """
        )
    )

    conn.execute(
        sa.text(
            """
            DELETE FROM permissions
            WHERE permission_key IN
            (
                'menu.audit_accept_proce.view',
                'api.audit_accept_proce.view',
                'api.audit_accept_proce.update'
            )
            """
        )
    )

    op.drop_index(
        "ix_audit_accept_responses_audit_template",
        table_name="audit_accept_responses",
    )
    op.drop_index(
        "ix_audit_accept_responses_item_id",
        table_name="audit_accept_responses",
    )
    op.drop_index(
        "ix_audit_accept_responses_template_id",
        table_name="audit_accept_responses",
    )
    op.drop_index(
        "ix_audit_accept_responses_audit_id",
        table_name="audit_accept_responses",
    )
    op.drop_table("audit_accept_responses")

    op.drop_index(
        "ix_audit_accept_items_template_type_active",
        table_name="audit_accept_items",
    )
    op.drop_index(
        "ix_audit_accept_items_template_sort",
        table_name="audit_accept_items",
    )
    op.drop_index(
        "ix_audit_accept_items_parent_item_id",
        table_name="audit_accept_items",
    )
    op.drop_index(
        "ix_audit_accept_items_template_id",
        table_name="audit_accept_items",
    )
    op.drop_table("audit_accept_items")

    op.drop_index(
        "ix_audit_accept_templates_is_active",
        table_name="audit_accept_templates",
    )
    op.drop_table("audit_accept_templates")