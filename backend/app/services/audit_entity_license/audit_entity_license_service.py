from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_entity_license_repository import (
    AuditEntityLicenseRepository,
)
from app.schemas.audit_entity_license import (
    AuditEntityLicenseCreate,
    AuditEntityLicenseUpdate,
)


ALLOWED_LICENSE_STATUSES = {
    "valid",
    "expired",
    "pending",
    "suspended",
    "cancelled",
    "not_applicable",
}


class AuditEntityLicenseService:
    def __init__(self, db: AsyncSession):
        self.license_repo = AuditEntityLicenseRepository(db)

    async def list_license_types(
        self,
        is_active: bool | None,
    ):
        total, items = await self.license_repo.list_license_types(is_active)

        return {
            "total": total,
            "items": items,
        }

    async def list_licenses(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        license_type_id: int | None,
        license_status: str | None,
        is_mandatory: bool | None,
        is_verified: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        if license_status:
            self._validate_license_status(license_status)

        total, items = await self.license_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            license_type_id=license_type_id,
            license_status=license_status,
            is_mandatory=is_mandatory,
            is_verified=is_verified,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_license(
        self,
        license_id: int,
    ):
        license_record = await self.license_repo.get_by_id_any_status(license_id)

        if not license_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity license not found.",
            )

        return license_record

    async def create_license(
        self,
        payload: AuditEntityLicenseCreate,
        created_by: str,
    ):
        self._validate_license_status(payload.license_status)
        self._validate_dates(payload.issue_date, payload.expiry_date)

        await self._validate_audit_entity(payload.audit_entity_id)
        await self._validate_license_type(payload.license_type_id)

        await self._validate_duplicate_license(
            audit_entity_id=payload.audit_entity_id,
            license_type_id=payload.license_type_id,
            license_no=payload.license_no,
            exclude_id=None,
        )

        license_record = await self.license_repo.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Audit entity license created successfully.",
            "data": license_record,
        }

    async def update_license(
        self,
        license_id: int,
        payload: AuditEntityLicenseUpdate,
        updated_by: str,
    ):
        license_record = await self.license_repo.get_by_id_any_status(license_id)

        if not license_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity license not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else license_record.audit_entity_id
        )
        next_license_type_id = (
            payload.license_type_id
            if "license_type_id" in fields_set and payload.license_type_id is not None
            else license_record.license_type_id
        )
        next_license_no = (
            payload.license_no
            if "license_no" in fields_set and payload.license_no is not None
            else license_record.license_no
        )
        next_license_status = (
            payload.license_status
            if "license_status" in fields_set and payload.license_status is not None
            else license_record.license_status
        )
        next_issue_date = (
            payload.issue_date
            if "issue_date" in fields_set
            else license_record.issue_date
        )
        next_expiry_date = (
            payload.expiry_date
            if "expiry_date" in fields_set
            else license_record.expiry_date
        )

        self._validate_license_status(next_license_status)
        self._validate_dates(next_issue_date, next_expiry_date)

        await self._validate_audit_entity(next_entity_id)
        await self._validate_license_type(next_license_type_id)

        await self._validate_duplicate_license(
            audit_entity_id=next_entity_id,
            license_type_id=next_license_type_id,
            license_no=next_license_no,
            exclude_id=license_record.id,
        )

        license_record = await self.license_repo.update(
            license_record=license_record,
            payload=payload,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity license updated successfully.",
            "data": license_record,
        }

    async def deactivate_license(
        self,
        license_id: int,
        updated_by: str,
    ):
        license_record = await self.license_repo.get_by_id_any_status(license_id)

        if not license_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity license not found.",
            )

        if not license_record.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity license is already inactive.",
            )

        license_record = await self.license_repo.set_active_status(
            license_record=license_record,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity license deactivated successfully.",
            "data": license_record,
        }

    async def restore_license(
        self,
        license_id: int,
        updated_by: str,
    ):
        license_record = await self.license_repo.get_by_id_any_status(license_id)

        if not license_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity license not found.",
            )

        if license_record.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity license is already active.",
            )

        license_record = await self.license_repo.set_active_status(
            license_record=license_record,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity license restored successfully.",
            "data": license_record,
        }

    async def permanent_delete_license(
        self,
        license_id: int,
    ):
        license_record = await self.license_repo.get_by_id_any_status(license_id)

        if not license_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity license not found.",
            )

        await self.license_repo.permanent_delete(license_record)

        return {
            "message": "Audit entity license permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.license_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_license_type(
        self,
        license_type_id: int,
    ) -> None:
        license_type = await self.license_repo.get_license_type_by_id(
            license_type_id
        )

        if not license_type or not license_type.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected license type is invalid or inactive.",
            )

    async def _validate_duplicate_license(
        self,
        audit_entity_id: int,
        license_type_id: int,
        license_no: str,
        exclude_id: int | None,
    ) -> None:
        existing = await self.license_repo.get_duplicate_license(
            audit_entity_id=audit_entity_id,
            license_type_id=license_type_id,
            license_no=license_no,
            exclude_id=exclude_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this license number under this license type.",
            )

    def _validate_license_status(
        self,
        license_status: str,
    ) -> None:
        if license_status not in ALLOWED_LICENSE_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid license status. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_LICENSE_STATUSES))
                ),
            )

    def _validate_dates(
        self,
        issue_date,
        expiry_date,
    ) -> None:
        if issue_date and expiry_date and expiry_date < issue_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expiry date cannot be earlier than issue date.",
            )
