from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_master import AuditMaster
from app.repositories.audit_visit_info_repository import AuditVisitInfoRepository
from app.schemas.audit_visit_info import AuditVisitInfoCreate, AuditVisitInfoUpdate


class AuditVisitInfoService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditVisitInfoRepository(db)

    async def list_audit_visit_info(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_id: int | None,
        team_id: int | None,
        status_filter: str | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_id=audit_id,
            team_id=team_id,
            status=status_filter,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_audit_visit_info(self, visit_id: int):
        item = await self.repository.get_by_id(visit_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit Visit Info record not found.",
            )

        return item

    async def _get_valid_audit_master(self, audit_id: int) -> AuditMaster:
        audit_master = await self.repository.get_active_audit_master_by_id(audit_id)

        if not audit_master:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Audit Master is invalid or inactive.",
            )

        return audit_master

    async def _validate_team(self, team_id: int) -> None:
        team = await self.repository.get_active_team_by_id(team_id)

        if not team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Audit Team is invalid or inactive.",
            )

    def _validate_visit_date(
        self,
        audit_master: AuditMaster,
        visit_date: date,
    ) -> None:
        if visit_date < audit_master.audit_start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visit date cannot be before audit start date.",
            )

        if visit_date > audit_master.audit_end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Visit date cannot be after audit end date.",
            )

    async def create_audit_visit_info(
        self,
        payload: AuditVisitInfoCreate,
        created_by: str,
    ):
        audit_master = await self._get_valid_audit_master(payload.audit_id)
        await self._validate_team(payload.team_id)
        self._validate_visit_date(
            audit_master=audit_master,
            visit_date=payload.visit_date,
        )

        item = await self.repository.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Audit Visit Info record created successfully.",
            "data": item,
        }

    async def update_audit_visit_info(
        self,
        visit_id: int,
        payload: AuditVisitInfoUpdate,
        updated_by: str,
    ):
        item = await self.get_audit_visit_info(visit_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        audit_id = update_data.get("audit_id", item.audit_id)
        team_id = update_data.get("team_id", item.team_id)
        visit_date = update_data.get("visit_date", item.visit_date)

        audit_master = await self._get_valid_audit_master(audit_id)
        await self._validate_team(team_id)
        self._validate_visit_date(
            audit_master=audit_master,
            visit_date=visit_date,
        )

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Visit Info record updated successfully.",
            "data": updated_item,
        }

    async def deactivate_audit_visit_info(
        self,
        visit_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_visit_info(visit_id)

        if not item.is_active:
            return {
                "message": "Audit Visit Info record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Visit Info record deactivated successfully.",
            "data": item,
        }

    async def restore_audit_visit_info(
        self,
        visit_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_visit_info(visit_id)

        if item.is_active:
            return {
                "message": "Audit Visit Info record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Visit Info record restored successfully.",
            "data": item,
        }

    async def permanent_delete_audit_visit_info(self, visit_id: int):
        item = await self.get_audit_visit_info(visit_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Audit Visit Info record permanently deleted successfully.",
            "data": None,
        }
