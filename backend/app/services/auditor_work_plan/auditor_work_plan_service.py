from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.auditor_work_plan_repository import AuditorWorkPlanRepository
from app.schemas.auditor_work_plan import (
    AuditorWorkPlanCreate,
    AuditorWorkPlanUpdate,
)


class AuditorWorkPlanService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditorWorkPlanRepository(db)

    async def list_auditor_work_plans(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        report_id: int | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            report_id=report_id,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_auditor_work_plan(self, plan_id: int):
        item = await self.repository.get_by_id(plan_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auditor Work Plan record not found.",
            )

        return item

    async def _validate_active_report(self, report_id: int) -> None:
        report = await self.repository.get_active_meeting_report_by_id(report_id)

        if not report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Meeting Report record is invalid or inactive.",
            )

    async def create_auditor_work_plan(
        self,
        payload: AuditorWorkPlanCreate,
        created_by: str,
    ):
        await self._validate_active_report(payload.report_id)

        existing = await self.repository.get_by_report_id(payload.report_id)

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Auditor Work Plan already exists for this Meeting Report.",
            )

        item = await self.repository.create(
            data=payload.model_dump(),
            created_by=created_by,
        )

        return {
            "message": "Auditor Work Plan record created successfully.",
            "data": item,
        }

    async def update_auditor_work_plan(
        self,
        plan_id: int,
        payload: AuditorWorkPlanUpdate,
        updated_by: str,
    ):
        item = await self.get_auditor_work_plan(plan_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "report_id" in update_data:
            await self._validate_active_report(update_data["report_id"])

            existing = await self.repository.get_by_report_id(
                report_id=update_data["report_id"],
                exclude_plan_id=plan_id,
            )

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Auditor Work Plan already exists for this Meeting Report.",
                )

        item = await self.repository.update(
            item=item,
            data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Auditor Work Plan record updated successfully.",
            "data": item,
        }

    async def deactivate_auditor_work_plan(
        self,
        plan_id: int,
        updated_by: str,
    ):
        item = await self.get_auditor_work_plan(plan_id)

        if not item.is_active:
            return {
                "message": "Auditor Work Plan record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Auditor Work Plan record deactivated successfully.",
            "data": item,
        }

    async def restore_auditor_work_plan(
        self,
        plan_id: int,
        updated_by: str,
    ):
        item = await self.get_auditor_work_plan(plan_id)

        if item.is_active:
            return {
                "message": "Auditor Work Plan record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Auditor Work Plan record restored successfully.",
            "data": item,
        }

    async def permanent_delete_auditor_work_plan(self, plan_id: int):
        item = await self.get_auditor_work_plan(plan_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Auditor Work Plan record permanently deleted successfully.",
            "data": None,
        }
