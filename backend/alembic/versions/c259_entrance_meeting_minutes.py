"""create entrance meeting minutes table

Revision ID: c259_entrance_meeting_minutes
Revises: c258_general_disc_title_text
Create Date: 2026-07-09
"""

from alembic import op
import sqlalchemy as sa


revision = "c259_entrance_meeting_minutes"
down_revision = "c258_general_disc_title_text"
branch_labels = None
depends_on = None

SEED_BY = "system"


def upgrade() -> None:
    op.create_table(
        "entrance_meeting_minutes",
        sa.Column("minute_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("meeting_id", sa.Integer(), nullable=False),
        sa.Column("chairman_participant_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(
            ["meeting_id"],
            ["meeting_master.meeting_id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["chairman_participant_id"],
            ["meeting_participants.participant_id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("minute_id"),
    )

    op.create_index(
        "ix_entrance_meeting_minutes_minute_id",
        "entrance_meeting_minutes",
        ["minute_id"],
    )
    op.create_index(
        "ix_entrance_meeting_minutes_meeting_id",
        "entrance_meeting_minutes",
        ["meeting_id"],
    )
    op.create_index(
        "ix_entrance_meeting_minutes_chairman_participant_id",
        "entrance_meeting_minutes",
        ["chairman_participant_id"],
    )
    op.create_index(
        "ix_entrance_meeting_minutes_status",
        "entrance_meeting_minutes",
        ["status"],
    )

    permission_rows = [
        ("menu.entrance_meeting_minutes.view", "menu", "entrance_meeting_minutes", "view", "View Entrance Meeting Minutes menu."),
        ("api.entrance_meeting_minutes.view", "api", "entrance_meeting_minutes", "view", "View records. Entrance Meeting Minutes"),
        ("api.entrance_meeting_minutes.create", "api", "entrance_meeting_minutes", "create", "Create records. Entrance Meeting Minutes"),
        ("api.entrance_meeting_minutes.update", "api", "entrance_meeting_minutes", "update", "Update records. Entrance Meeting Minutes"),
        ("api.entrance_meeting_minutes.delete", "api", "entrance_meeting_minutes", "delete", "Deactivate records. Entrance Meeting Minutes"),
        ("api.entrance_meeting_minutes.restore", "api", "entrance_meeting_minutes", "restore", "Restore inactive records. Entrance Meeting Minutes"),
        ("api.entrance_meeting_minutes.permanent_delete", "api", "entrance_meeting_minutes", "permanent_delete", "Permanently delete records. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.view", "button", "entrance_meeting_minutes", "view", "Show view action. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.create", "button", "entrance_meeting_minutes", "create", "Show create button. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.update", "button", "entrance_meeting_minutes", "update", "Show update button. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.delete", "button", "entrance_meeting_minutes", "delete", "Show inactive/delete button. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.restore", "button", "entrance_meeting_minutes", "restore", "Show restore button. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.permanent_delete", "button", "entrance_meeting_minutes", "permanent_delete", "Show permanent delete button. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.export", "button", "entrance_meeting_minutes", "export", "Show export button. Entrance Meeting Minutes"),
        ("button.entrance_meeting_minutes.import", "button", "entrance_meeting_minutes", "import", "Show import button. Entrance Meeting Minutes"),
    ]

    for permission_key, resource_type, resource_key, action, description in permission_rows:
        op.execute(
            sa.text(
                """
                insert into permissions (
                    permission_key,
                    resource_type,
                    resource_key,
                    action,
                    description,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                values (
                    :permission_key,
                    :resource_type,
                    :resource_key,
                    :action,
                    :description,
                    true,
                    :seed_by,
                    :seed_by,
                    now(),
                    now()
                )
                on conflict (permission_key) do update
                set resource_type = excluded.resource_type,
                    resource_key = excluded.resource_key,
                    action = excluded.action,
                    description = excluded.description,
                    is_active = true,
                    updated_by = excluded.updated_by,
                    updated_at = now()
                """
            ).bindparams(
                permission_key=permission_key,
                resource_type=resource_type,
                resource_key=resource_key,
                action=action,
                description=description,
                seed_by=SEED_BY,
            )
        )

    op.execute(
        """
        insert into menus (
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
        select
            mr.navigation_group_id,
            mr.parent_menu_id,
            'entrance_meeting_minutes',
            'Entrance Meeting Minutes',
            '/audit-meetings/minutes/entrance',
            'FileText',
            'menu.entrance_meeting_minutes.view',
            coalesce(mr.sort_order, 20) + 1,
            mr.menu_level,
            false,
            true,
            true,
            'system',
            'system',
            now(),
            now()
        from menus mr
        where mr.route_path = '/audit-meetings/reports'
          and not exists (
              select 1 from menus m where m.menu_key = 'entrance_meeting_minutes'
          )
        limit 1
        """
    )

    op.execute(
        """
        insert into role_permissions (
            role_id,
            permission_id,
            is_active,
            created_by,
            updated_by,
            created_at,
            updated_at
        )
        select
            1,
            p.id,
            true,
            'system',
            'system',
            now(),
            now()
        from permissions p
        where p.permission_key like 'menu.entrance_meeting_minutes.%'
           or p.permission_key like 'api.entrance_meeting_minutes.%'
           or p.permission_key like 'button.entrance_meeting_minutes.%'
        on conflict do nothing
        """
    )


def downgrade() -> None:
    op.execute(
        """
        delete from role_permissions
        where permission_id in (
            select id
            from permissions
            where permission_key like 'menu.entrance_meeting_minutes.%'
               or permission_key like 'api.entrance_meeting_minutes.%'
               or permission_key like 'button.entrance_meeting_minutes.%'
        )
        """
    )
    op.execute("delete from menus where menu_key = 'entrance_meeting_minutes'")
    op.execute(
        """
        delete from permissions
        where permission_key like 'menu.entrance_meeting_minutes.%'
           or permission_key like 'api.entrance_meeting_minutes.%'
           or permission_key like 'button.entrance_meeting_minutes.%'
        """
    )

    op.drop_index(
        "ix_entrance_meeting_minutes_status",
        table_name="entrance_meeting_minutes",
    )
    op.drop_index(
        "ix_entrance_meeting_minutes_chairman_participant_id",
        table_name="entrance_meeting_minutes",
    )
    op.drop_index(
        "ix_entrance_meeting_minutes_meeting_id",
        table_name="entrance_meeting_minutes",
    )
    op.drop_index(
        "ix_entrance_meeting_minutes_minute_id",
        table_name="entrance_meeting_minutes",
    )
    op.drop_table("entrance_meeting_minutes")
