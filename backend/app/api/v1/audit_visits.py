from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_visit import (
    AuditVisitListResponse,
)
from app.services.audit_visit.audit_visit_service import (
    AuditVisitService,
)


router = APIRouter(
    prefix="/audit-visits",
    tags=["Audit Visit"],
)


@router.get("", response_model=AuditVisitListResponse)
async def list_audit_visits(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.audit_visit.view")
    ),
):
    service = AuditVisitService(db)

    return await service.list_audit_visits(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
    )
