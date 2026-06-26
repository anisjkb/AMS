from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.me import router as me_router

from app.api.v1.users import router as users_router
from app.api.v1.roles import router as roles_router
from app.api.v1.permissions import router as permissions_router
from app.api.v1.user_roles import router as user_roles_router
from app.api.v1.role_permissions import router as role_permissions_router

from app.api.v1.navigation_groups import router as navigation_groups_router
from app.api.v1.menus import router as menus_router
from app.api.v1.menu_actions import router as menu_actions_router
from app.api.v1.menu_permissions import router as menu_permissions_router
from app.api.v1.menu_action_permissions import (
    router as menu_action_permissions_router,
)

from app.api.v1.companies import router as companies_router
from app.api.v1.branches import router as branches_router
from app.api.v1.departments import router as departments_router
from app.api.v1.designations import router as designations_router
from app.api.v1.employees import router as employees_router

from app.api.v1.audit_subjects import router as audit_subjects_router
from app.api.v1.audit_entities import router as audit_entities_router
from app.api.v1.audit_entity_business_activities import (
    router as audit_entity_business_activities_router,
)
from app.api.v1.audit_entity_exchange_listings import (
    router as audit_entity_exchange_listings_router,
)
from app.api.v1.audit_entity_addresses import (
    router as audit_entity_addresses_router,
)
from app.api.v1.audit_entity_contacts import (
    router as audit_entity_contacts_router,
)
from app.api.v1.audit_entity_directors import (
    router as audit_entity_directors_router,
)
from app.api.v1.audit_entity_licenses import (
    router as audit_entity_licenses_router,
)
from app.api.v1.audit_entity_facilities import (
    router as audit_entity_facilities_router,
)
from app.api.v1.audit_entity_financial_snapshots import (
    router as audit_entity_financial_snapshots_router,
)
from app.api.v1.audit_entity_tax_assessments import (
    router as audit_entity_tax_assessments_router,
)
from app.api.v1.business_masters import router as business_masters_router
from app.api.v1.legal_statuses import router as legal_statuses_router


api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(auth_router)
api_router.include_router(me_router)

api_router.include_router(users_router)
api_router.include_router(roles_router)
api_router.include_router(permissions_router)
api_router.include_router(user_roles_router)
api_router.include_router(role_permissions_router)

api_router.include_router(navigation_groups_router)
api_router.include_router(menus_router)
api_router.include_router(menu_actions_router)
api_router.include_router(menu_permissions_router)
api_router.include_router(menu_action_permissions_router)

api_router.include_router(companies_router)
api_router.include_router(branches_router)
api_router.include_router(departments_router)
api_router.include_router(designations_router)
api_router.include_router(employees_router)

api_router.include_router(audit_subjects_router)
api_router.include_router(audit_entities_router)
api_router.include_router(audit_entity_business_activities_router)
api_router.include_router(audit_entity_exchange_listings_router)
api_router.include_router(audit_entity_addresses_router)
api_router.include_router(audit_entity_contacts_router)
api_router.include_router(audit_entity_directors_router)
api_router.include_router(audit_entity_licenses_router)
api_router.include_router(audit_entity_facilities_router)
api_router.include_router(audit_entity_financial_snapshots_router)
api_router.include_router(audit_entity_tax_assessments_router)

api_router.include_router(business_masters_router)
api_router.include_router(legal_statuses_router)
