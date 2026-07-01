from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.auditor_work_plan import (
    AuditorWorkPlanCreate,
    AuditorWorkPlanListResponse,
    AuditorWorkPlanMessageResponse,
    AuditorWorkPlanResponse,
    AuditorWorkPlanUpdate,
)
from app.services.auditor_work_plan.auditor_work_plan_service import (
    AuditorWorkPlanService,
)


router = APIRouter(prefix="/auditor-work-plan", tags=["Auditor Work Plan"])


@router.get("", response_model=AuditorWorkPlanListResponse)
async def list_auditor_work_plans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    report_id: int | None = None,
    sort_by: str = "plan_id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.auditor_work_plan.view")),
):
    service = AuditorWorkPlanService(db)

    return await service.list_auditor_work_plans(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        report_id=report_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{plan_id}", response_model=AuditorWorkPlanResponse)
async def get_auditor_work_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.auditor_work_plan.view")),
):
    service = AuditorWorkPlanService(db)
    return await service.get_auditor_work_plan(plan_id)


@router.post(
    "",
    response_model=AuditorWorkPlanMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_auditor_work_plan(
    payload: AuditorWorkPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.auditor_work_plan.create")),
):
    service = AuditorWorkPlanService(db)

    return await service.create_auditor_work_plan(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{plan_id}", response_model=AuditorWorkPlanMessageResponse)
async def update_auditor_work_plan(
    plan_id: int,
    payload: AuditorWorkPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.auditor_work_plan.update")),
):
    service = AuditorWorkPlanService(db)

    return await service.update_auditor_work_plan(
        plan_id=plan_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{plan_id}", response_model=AuditorWorkPlanMessageResponse)
async def delete_auditor_work_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.auditor_work_plan.delete")),
):
    service = AuditorWorkPlanService(db)

    return await service.deactivate_auditor_work_plan(
        plan_id=plan_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{plan_id}/restore", response_model=AuditorWorkPlanMessageResponse)
async def restore_auditor_work_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.auditor_work_plan.restore")),
):
    service = AuditorWorkPlanService(db)

    return await service.restore_auditor_work_plan(
        plan_id=plan_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{plan_id}/permanent",
    response_model=AuditorWorkPlanMessageResponse,
)
async def permanent_delete_auditor_work_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.auditor_work_plan.permanent_delete")
    ),
):
    service = AuditorWorkPlanService(db)
    return await service.permanent_delete_auditor_work_plan(plan_id)
