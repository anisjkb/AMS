"""add audit accept consultation menu

Revision ID: ab25560d1a3e
Revises: 35a052fd14ed
Create Date: 2026-08-04 00:00:05.550816

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab25560d1a3e'
down_revision: Union[str, Sequence[str], None] = '35a052fd14ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    conn = op.get_bind()

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

    parent_menu_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM menus
            WHERE menu_key = 'audit_accept_proce'
            LIMIT 1
            """
        )
    ).scalar()


    if not navigation_group_id or not parent_menu_id:
        raise RuntimeError(
            "Audit navigation group or Acceptance Procedures parent menu not found."
        )


    menu_id = conn.execute(
        sa.text(
            """
            SELECT id
            FROM menus
            WHERE menu_key = 'consultation_management'
            LIMIT 1
            """
        )
    ).scalar()


    values = {
        "navigation_group_id": navigation_group_id,
        "parent_menu_id": parent_menu_id,
        "menu_title": "Consultation Management",
        "route_path":
            "/audit-planning/consultation-management",
        "permission_key":
            "api.consultation_management.view",
        "seed":
            "migration:ab25560d1a3e",
    }


    if menu_id is None:

        conn.execute(
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
                    'consultation_management',
                    :menu_title,
                    :route_path,
                    'Users',
                    :permission_key,
                    35,
                    3,
                    false,
                    true,
                    true,
                    :seed,
                    :seed,
                    now(),
                    now()
                )
                """
            ),
            values,
        )


def downgrade() -> None:
    """Downgrade schema."""

    conn = op.get_bind()

    conn.execute(
        sa.text(
            """
            DELETE FROM menus
            WHERE menu_key =
            'audit_accept_consultation_management'
            """
        )
    )
