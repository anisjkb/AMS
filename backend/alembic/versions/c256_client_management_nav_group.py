"""move client entity menus to client management group

Revision ID: c256_client_mgmt_nav
Revises: c255_audit_type_menu
Create Date: 2026-07-08
"""

from alembic import op
import sqlalchemy as sa


revision = "c256_client_mgmt_nav"
down_revision = "c255_audit_type_menu"
branch_labels = None
depends_on = None


SEED_BY = "c256_client_management_navigation_seed"


navigation_groups = sa.table(
    "navigation_groups",
    sa.column("id", sa.Integer),
    sa.column("group_key", sa.String),
    sa.column("group_title", sa.String),
    sa.column("group_icon", sa.String),
    sa.column("parent_group_id", sa.Integer),
    sa.column("sort_order", sa.Integer),
    sa.column("is_collapsible", sa.Boolean),
    sa.column("is_visible", sa.Boolean),
    sa.column("group_badge", sa.String),
    sa.column("group_color", sa.String),
    sa.column("group_permission_key", sa.String),
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


CLIENT_MENU_RULES = [
    {
        "title": "Clients/Entities",
        "keys": ["audit_entities", "audit_entity", "clients_entities", "clients_entities"],
        "sort_order": 10,
    },
    {
        "title": "Business Activities",
        "keys": ["audit_entity_business_activities", "audit_entity_business_activity", "business_activities"],
        "sort_order": 20,
    },
    {
        "title": "Exchange Listings",
        "keys": ["audit_entity_exchange_listings", "audit_entity_exchange_listing", "exchange_listings"],
        "sort_order": 30,
    },
    {
        "title": "Entity Addresses",
        "keys": ["audit_entity_addresses", "audit_entity_address", "entity_addresses"],
        "sort_order": 40,
    },
    {
        "title": "Entity Contacts",
        "keys": ["audit_entity_contacts", "audit_entity_contact", "entity_contacts"],
        "sort_order": 50,
    },
    {
        "title": "Directors / Owners",
        "keys": ["audit_entity_directors", "audit_entity_director", "directors_owners", "directors"],
        "sort_order": 60,
    },
    {
        "title": "Entity Licenses",
        "keys": ["audit_entity_licenses", "audit_entity_license", "entity_licenses"],
        "sort_order": 70,
    },
    {
        "title": "Facilities / Factories",
        "keys": ["audit_entity_facilities", "audit_entity_facility", "facilities_factories", "facilities"],
        "sort_order": 80,
    },
    {
        "title": "Financial Snapshots",
        "keys": ["audit_entity_financial_snapshots", "audit_entity_financial_snapshot", "financial_snapshots"],
        "sort_order": 90,
    },
    {
        "title": "Tax Assessments",
        "keys": ["audit_entity_tax_assessments", "audit_entity_tax_assessment", "tax_assessments"],
        "sort_order": 100,
    },
]


def _scalar(bind, statement):
    return bind.execute(statement).scalar_one_or_none()


def _get_group_id(bind, group_key: str, group_title: str):
    return _scalar(
        bind,
        sa.select(navigation_groups.c.id).where(
            sa.or_(
                navigation_groups.c.group_key == group_key,
                sa.func.lower(navigation_groups.c.group_title) == group_title.lower(),
            )
        ),
    )


def _get_client_management_group_id(bind):
    group_id = _get_group_id(bind, "client_management", "Client Management")

    if group_id is None:
        bind.execute(
            navigation_groups.insert().values(
                group_key="client_management",
                group_title="Client Management",
                group_icon="Building2",
                parent_group_id=None,
                sort_order=25,
                is_collapsible=True,
                is_visible=True,
                group_badge=None,
                group_color="blue",
                group_permission_key=None,
                is_active=True,
                created_by=SEED_BY,
                updated_by=SEED_BY,
                created_at=sa.func.now(),
                updated_at=sa.func.now(),
            )
        )

        group_id = _get_group_id(bind, "client_management", "Client Management")
    else:
        bind.execute(
            navigation_groups.update()
            .where(navigation_groups.c.id == group_id)
            .values(
                group_key="client_management",
                group_title="Client Management",
                group_icon="Building2",
                parent_group_id=None,
                sort_order=25,
                is_collapsible=True,
                is_visible=True,
                group_color="blue",
                is_active=True,
                updated_by=SEED_BY,
                updated_at=sa.func.now(),
            )
        )

    return group_id


def upgrade() -> None:
    bind = op.get_bind()
    client_management_group_id = _get_client_management_group_id(bind)

    for rule in CLIENT_MENU_RULES:
        menu_ids = bind.execute(
            sa.select(menus.c.id).where(
                sa.or_(
                    menus.c.menu_title == rule["title"],
                    menus.c.menu_key.in_(rule["keys"]),
                )
            )
        ).scalars().all()

        for menu_id in menu_ids:
            bind.execute(
                menus.update()
                .where(menus.c.id == menu_id)
                .values(
                    navigation_group_id=client_management_group_id,
                    parent_menu_id=None,
                    sort_order=rule["sort_order"],
                    menu_level=1,
                    is_expandable=False,
                    is_visible=True,
                    is_active=True,
                    updated_by=SEED_BY,
                    updated_at=sa.func.now(),
                )
            )


def downgrade() -> None:
    bind = op.get_bind()

    audit_group_id = _get_group_id(bind, "audit", "Audit")
    client_management_group_id = _get_group_id(
        bind,
        "client_management",
        "Client Management",
    )

    if audit_group_id is not None:
        for rule in CLIENT_MENU_RULES:
            bind.execute(
                menus.update()
                .where(
                    sa.or_(
                        menus.c.menu_title == rule["title"],
                        menus.c.menu_key.in_(rule["keys"]),
                    )
                )
                .values(
                    navigation_group_id=audit_group_id,
                    parent_menu_id=None,
                    menu_level=1,
                    updated_by=SEED_BY,
                    updated_at=sa.func.now(),
                )
            )

    if client_management_group_id is not None:
        bind.execute(
            navigation_groups.delete().where(
                navigation_groups.c.id == client_management_group_id
            )
        )
