from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.companies import router as companies_router
from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.api.v1.me import router as me_router
from app.api.v1.branches import router as branches_router
from app.api.v1.departments import router as departments_router
from app.api.v1.designations import router as designations_router
from app.api.v1.employees import router as employees_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(companies_router)
api_router.include_router(me_router)
api_router.include_router(branches_router)
api_router.include_router(departments_router)
api_router.include_router(designations_router)
api_router.include_router(employees_router)