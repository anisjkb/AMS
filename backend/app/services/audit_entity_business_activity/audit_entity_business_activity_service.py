from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity_business_activity import AuditEntityBusinessActivity
from app.repositories.audit_entity_business_activity_repository import (
    AuditEntityBusinessActivityRepository,
)
from app.schemas.audit_entity_business_activity import (
    AuditEntityBusinessActivityCreate,
    AuditEntityBusinessActivityUpdate,
)


class AuditEntityBusinessActivityService:
    def __init__(self, db: AsyncSession):
        self.activity_repo = AuditEntityBusinessActivityRepository(db)

    async def list_business_activities(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        business_nature_id: int | None,
        business_sector_id: int | None,
        business_industry_id: int | None,
        is_primary: bool | None,
        risk_rating: str | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.activity_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            business_nature_id=business_nature_id,
            business_sector_id=business_sector_id,
            business_industry_id=business_industry_id,
            is_primary=is_primary,
            risk_rating=risk_rating,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_business_activity(
        self,
        activity_id: int,
    ):
        activity = await self.activity_repo.get_by_id_any_status(activity_id)

        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity business activity not found.",
            )

        return activity

    async def create_business_activity(
        self,
        payload: AuditEntityBusinessActivityCreate,
        created_by: str,
    ):
        await self._validate_audit_entity(payload.audit_entity_id)

        await self._validate_business_master_selection(
            business_nature_id=payload.business_nature_id,
            business_sector_id=payload.business_sector_id,
            business_industry_id=payload.business_industry_id,
        )

        activity_code = payload.activity_code

        if not activity_code:
            activity_code = await self._generate_activity_code()

        existing_code = await self.activity_repo.get_by_code(activity_code)

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Business activity code already exists.",
            )

        existing_activity = await self.activity_repo.get_by_entity_and_industry(
            audit_entity_id=payload.audit_entity_id,
            business_industry_id=payload.business_industry_id,
        )

        if existing_activity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this business industry activity.",
            )

        activity = await self.activity_repo.create(
            payload=payload,
            activity_code=activity_code,
            created_by=created_by,
        )

        if activity.is_primary:
            await self._apply_primary_activity(
                activity=activity,
                updated_by=created_by,
            )

        return {
            "message": "Audit entity business activity created successfully.",
            "data": activity,
        }

    async def update_business_activity(
        self,
        activity_id: int,
        payload: AuditEntityBusinessActivityUpdate,
        updated_by: str,
    ):
        activity = await self.activity_repo.get_by_id_any_status(activity_id)

        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity business activity not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else activity.audit_entity_id
        )
        next_business_nature_id = (
            payload.business_nature_id
            if "business_nature_id" in fields_set
            and payload.business_nature_id is not None
            else activity.business_nature_id
        )
        next_business_sector_id = (
            payload.business_sector_id
            if "business_sector_id" in fields_set
            and payload.business_sector_id is not None
            else activity.business_sector_id
        )
        next_business_industry_id = (
            payload.business_industry_id
            if "business_industry_id" in fields_set
            and payload.business_industry_id is not None
            else activity.business_industry_id
        )
        next_is_primary = (
            payload.is_primary
            if "is_primary" in fields_set and payload.is_primary is not None
            else activity.is_primary
        )

        await self._validate_audit_entity(next_entity_id)

        await self._validate_business_master_selection(
            business_nature_id=next_business_nature_id,
            business_sector_id=next_business_sector_id,
            business_industry_id=next_business_industry_id,
        )

        if payload.activity_code and payload.activity_code != activity.activity_code:
            existing_code = await self.activity_repo.get_by_code(
                payload.activity_code
            )

            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Business activity code already exists.",
                )

        existing_activity = await self.activity_repo.get_by_entity_and_industry(
            audit_entity_id=next_entity_id,
            business_industry_id=next_business_industry_id,
            exclude_id=activity.id,
        )

        if existing_activity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this business industry activity.",
            )

        updated_activity = await self.activity_repo.update(
            activity=activity,
            payload=payload,
            updated_by=updated_by,
        )

        if next_is_primary:
            await self._apply_primary_activity(
                activity=updated_activity,
                updated_by=updated_by,
            )

        return {
            "message": "Audit entity business activity updated successfully.",
            "data": updated_activity,
        }

    async def deactivate_business_activity(
        self,
        activity_id: int,
        updated_by: str,
    ):
        activity = await self.activity_repo.get_by_id_any_status(activity_id)

        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity business activity not found.",
            )

        if not activity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Business activity is already inactive.",
            )

        activity = await self.activity_repo.set_active_status(
            activity=activity,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity business activity deactivated successfully.",
            "data": activity,
        }

    async def restore_business_activity(
        self,
        activity_id: int,
        updated_by: str,
    ):
        activity = await self.activity_repo.get_by_id_any_status(activity_id)

        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity business activity not found.",
            )

        if activity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Business activity is already active.",
            )

        activity = await self.activity_repo.set_active_status(
            activity=activity,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity business activity restored successfully.",
            "data": activity,
        }

    async def permanent_delete_business_activity(
        self,
        activity_id: int,
    ):
        activity = await self.activity_repo.get_by_id_any_status(activity_id)

        if not activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity business activity not found.",
            )

        await self.activity_repo.permanent_delete(activity)

        return {
            "message": "Audit entity business activity permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.activity_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_business_master_selection(
        self,
        business_nature_id: int,
        business_sector_id: int,
        business_industry_id: int,
    ) -> None:
        nature = await self.activity_repo.get_business_nature_by_id(
            business_nature_id
        )

        if not nature or not nature.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected business nature is invalid.",
            )

        sector = await self.activity_repo.get_business_sector_by_id(
            business_sector_id
        )

        if not sector or not sector.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected business sector is invalid.",
            )

        if sector.nature_id != business_nature_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected business sector does not belong to selected business nature.",
            )

        industry = await self.activity_repo.get_business_industry_by_id(
            business_industry_id
        )

        if not industry or not industry.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected business industry is invalid.",
            )

        if industry.sector_id != business_sector_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected business industry does not belong to selected business sector.",
            )

    async def _apply_primary_activity(
        self,
        activity: AuditEntityBusinessActivity,
        updated_by: str,
    ) -> None:
        await self.activity_repo.set_other_activities_non_primary(
            audit_entity_id=activity.audit_entity_id,
            exclude_id=activity.id,
            updated_by=updated_by,
        )

    async def _generate_activity_code(self) -> str:
        last_activity = await self.activity_repo.get_last_activity()

        if not last_activity:
            return "EBA-0001"

        next_id = last_activity.id + 1

        return f"EBA-{next_id:04d}"
