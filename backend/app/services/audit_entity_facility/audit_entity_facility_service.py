from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity_facility import AuditEntityFacility
from app.repositories.audit_entity_facility_repository import (
    AuditEntityFacilityRepository,
)
from app.schemas.audit_entity_facility import (
    AuditEntityFacilityCreate,
    AuditEntityFacilityUpdate,
)


ALLOWED_FACILITY_STATUSES = {
    "operational",
    "under_construction",
    "temporarily_closed",
    "closed",
    "inactive",
}

ALLOWED_OWNERSHIP_TYPES = {
    "owned",
    "rented",
    "leased",
    "third_party",
    "shared",
    "other",
}


class AuditEntityFacilityService:
    def __init__(self, db: AsyncSession):
        self.facility_repo = AuditEntityFacilityRepository(db)

    async def list_facility_types(
        self,
        is_active: bool | None,
    ):
        total, items = await self.facility_repo.list_facility_types(is_active)

        return {
            "total": total,
            "items": items,
        }

    async def list_facilities(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        facility_type_id: int | None,
        facility_status: str | None,
        ownership_type: str | None,
        is_primary: bool | None,
        is_operational: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        if facility_status:
            self._validate_facility_status(facility_status)

        if ownership_type:
            self._validate_ownership_type(ownership_type)

        total, items = await self.facility_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            facility_type_id=facility_type_id,
            facility_status=facility_status,
            ownership_type=ownership_type,
            is_primary=is_primary,
            is_operational=is_operational,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_facility(
        self,
        facility_id: int,
    ):
        facility = await self.facility_repo.get_by_id_any_status(facility_id)

        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity facility not found.",
            )

        return facility

    async def create_facility(
        self,
        payload: AuditEntityFacilityCreate,
        created_by: str,
    ):
        self._validate_facility_status(payload.facility_status)

        if payload.ownership_type:
            self._validate_ownership_type(payload.ownership_type)

        self._validate_dates(payload.opening_date, payload.closing_date)

        await self._validate_audit_entity(payload.audit_entity_id)
        await self._validate_facility_type(payload.facility_type_id)

        await self._validate_duplicate_facility(
            audit_entity_id=payload.audit_entity_id,
            facility_type_id=payload.facility_type_id,
            facility_name=payload.facility_name,
            exclude_id=None,
        )

        facility = await self.facility_repo.create(
            payload=payload,
            created_by=created_by,
        )

        if facility.is_primary:
            await self._apply_primary_facility(
                facility=facility,
                updated_by=created_by,
            )

        return {
            "message": "Audit entity facility created successfully.",
            "data": facility,
        }

    async def update_facility(
        self,
        facility_id: int,
        payload: AuditEntityFacilityUpdate,
        updated_by: str,
    ):
        facility = await self.facility_repo.get_by_id_any_status(facility_id)

        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity facility not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else facility.audit_entity_id
        )
        next_facility_type_id = (
            payload.facility_type_id
            if "facility_type_id" in fields_set and payload.facility_type_id is not None
            else facility.facility_type_id
        )
        next_facility_name = (
            payload.facility_name
            if "facility_name" in fields_set and payload.facility_name is not None
            else facility.facility_name
        )
        next_facility_status = (
            payload.facility_status
            if "facility_status" in fields_set and payload.facility_status is not None
            else facility.facility_status
        )
        next_ownership_type = (
            payload.ownership_type
            if "ownership_type" in fields_set
            else facility.ownership_type
        )
        next_opening_date = (
            payload.opening_date
            if "opening_date" in fields_set
            else facility.opening_date
        )
        next_closing_date = (
            payload.closing_date
            if "closing_date" in fields_set
            else facility.closing_date
        )
        next_is_primary = (
            payload.is_primary
            if "is_primary" in fields_set and payload.is_primary is not None
            else facility.is_primary
        )

        self._validate_facility_status(next_facility_status)

        if next_ownership_type:
            self._validate_ownership_type(next_ownership_type)

        self._validate_dates(next_opening_date, next_closing_date)

        await self._validate_audit_entity(next_entity_id)
        await self._validate_facility_type(next_facility_type_id)

        await self._validate_duplicate_facility(
            audit_entity_id=next_entity_id,
            facility_type_id=next_facility_type_id,
            facility_name=next_facility_name,
            exclude_id=facility.id,
        )

        facility = await self.facility_repo.update(
            facility=facility,
            payload=payload,
            updated_by=updated_by,
        )

        if next_is_primary:
            await self._apply_primary_facility(
                facility=facility,
                updated_by=updated_by,
            )

        return {
            "message": "Audit entity facility updated successfully.",
            "data": facility,
        }

    async def deactivate_facility(
        self,
        facility_id: int,
        updated_by: str,
    ):
        facility = await self.facility_repo.get_by_id_any_status(facility_id)

        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity facility not found.",
            )

        if not facility.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity facility is already inactive.",
            )

        facility = await self.facility_repo.set_active_status(
            facility=facility,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity facility deactivated successfully.",
            "data": facility,
        }

    async def restore_facility(
        self,
        facility_id: int,
        updated_by: str,
    ):
        facility = await self.facility_repo.get_by_id_any_status(facility_id)

        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity facility not found.",
            )

        if facility.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity facility is already active.",
            )

        facility = await self.facility_repo.set_active_status(
            facility=facility,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity facility restored successfully.",
            "data": facility,
        }

    async def permanent_delete_facility(
        self,
        facility_id: int,
    ):
        facility = await self.facility_repo.get_by_id_any_status(facility_id)

        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity facility not found.",
            )

        await self.facility_repo.permanent_delete(facility)

        return {
            "message": "Audit entity facility permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.facility_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_facility_type(
        self,
        facility_type_id: int,
    ) -> None:
        facility_type = await self.facility_repo.get_facility_type_by_id(
            facility_type_id
        )

        if not facility_type or not facility_type.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected facility type is invalid or inactive.",
            )

    async def _validate_duplicate_facility(
        self,
        audit_entity_id: int,
        facility_type_id: int,
        facility_name: str,
        exclude_id: int | None,
    ) -> None:
        existing = await self.facility_repo.get_duplicate_facility(
            audit_entity_id=audit_entity_id,
            facility_type_id=facility_type_id,
            facility_name=facility_name,
            exclude_id=exclude_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this facility name under this facility type.",
            )

    def _validate_facility_status(
        self,
        facility_status: str,
    ) -> None:
        if facility_status not in ALLOWED_FACILITY_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid facility status. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_FACILITY_STATUSES))
                ),
            )

    def _validate_ownership_type(
        self,
        ownership_type: str,
    ) -> None:
        if ownership_type not in ALLOWED_OWNERSHIP_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid ownership type. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_OWNERSHIP_TYPES))
                ),
            )

    def _validate_dates(
        self,
        opening_date,
        closing_date,
    ) -> None:
        if opening_date and closing_date and closing_date < opening_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Closing date cannot be earlier than opening date.",
            )

    async def _apply_primary_facility(
        self,
        facility: AuditEntityFacility,
        updated_by: str,
    ) -> None:
        await self.facility_repo.set_other_facilities_non_primary(
            audit_entity_id=facility.audit_entity_id,
            exclude_id=facility.id,
            updated_by=updated_by,
        )
