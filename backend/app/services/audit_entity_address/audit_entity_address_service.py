from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity_address import AuditEntityAddress
from app.repositories.audit_entity_address_repository import (
    AuditEntityAddressRepository,
)
from app.schemas.audit_entity_address import (
    AuditEntityAddressCreate,
    AuditEntityAddressUpdate,
)


class AuditEntityAddressService:
    def __init__(self, db: AsyncSession):
        self.address_repo = AuditEntityAddressRepository(db)

    async def list_address_types(
        self,
        is_active: bool | None,
    ):
        total, items = await self.address_repo.list_address_types(is_active)

        return {
            "total": total,
            "items": items,
        }

    async def list_addresses(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        address_type_id: int | None,
        is_primary: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.address_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            address_type_id=address_type_id,
            is_primary=is_primary,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_address(
        self,
        address_id: int,
    ):
        address = await self.address_repo.get_by_id_any_status(address_id)

        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity address not found.",
            )

        return address

    async def create_address(
        self,
        payload: AuditEntityAddressCreate,
        created_by: str,
    ):
        await self._validate_audit_entity(payload.audit_entity_id)
        await self._validate_address_type(payload.address_type_id)

        await self._validate_unique_entity_address_type(
            audit_entity_id=payload.audit_entity_id,
            address_type_id=payload.address_type_id,
            exclude_id=None,
        )

        address = await self.address_repo.create(
            payload=payload,
            created_by=created_by,
        )

        if address.is_primary:
            await self._apply_primary_address(
                address=address,
                updated_by=created_by,
            )

        return {
            "message": "Audit entity address created successfully.",
            "data": address,
        }

    async def update_address(
        self,
        address_id: int,
        payload: AuditEntityAddressUpdate,
        updated_by: str,
    ):
        address = await self.address_repo.get_by_id_any_status(address_id)

        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity address not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else address.audit_entity_id
        )
        next_address_type_id = (
            payload.address_type_id
            if "address_type_id" in fields_set and payload.address_type_id is not None
            else address.address_type_id
        )
        next_is_primary = (
            payload.is_primary
            if "is_primary" in fields_set and payload.is_primary is not None
            else address.is_primary
        )

        await self._validate_audit_entity(next_entity_id)
        await self._validate_address_type(next_address_type_id)

        await self._validate_unique_entity_address_type(
            audit_entity_id=next_entity_id,
            address_type_id=next_address_type_id,
            exclude_id=address.id,
        )

        address = await self.address_repo.update(
            address=address,
            payload=payload,
            updated_by=updated_by,
        )

        if next_is_primary:
            await self._apply_primary_address(
                address=address,
                updated_by=updated_by,
            )

        return {
            "message": "Audit entity address updated successfully.",
            "data": address,
        }

    async def deactivate_address(
        self,
        address_id: int,
        updated_by: str,
    ):
        address = await self.address_repo.get_by_id_any_status(address_id)

        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity address not found.",
            )

        if not address.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity address is already inactive.",
            )

        address = await self.address_repo.set_active_status(
            address=address,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity address deactivated successfully.",
            "data": address,
        }

    async def restore_address(
        self,
        address_id: int,
        updated_by: str,
    ):
        address = await self.address_repo.get_by_id_any_status(address_id)

        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity address not found.",
            )

        if address.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity address is already active.",
            )

        address = await self.address_repo.set_active_status(
            address=address,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity address restored successfully.",
            "data": address,
        }

    async def permanent_delete_address(
        self,
        address_id: int,
    ):
        address = await self.address_repo.get_by_id_any_status(address_id)

        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity address not found.",
            )

        await self.address_repo.permanent_delete(address)

        return {
            "message": "Audit entity address permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.address_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_address_type(
        self,
        address_type_id: int,
    ) -> None:
        address_type = await self.address_repo.get_address_type_by_id(
            address_type_id
        )

        if not address_type or not address_type.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected address type is invalid or inactive.",
            )

    async def _validate_unique_entity_address_type(
        self,
        audit_entity_id: int,
        address_type_id: int,
        exclude_id: int | None,
    ) -> None:
        existing = await self.address_repo.get_by_entity_and_type(
            audit_entity_id=audit_entity_id,
            address_type_id=address_type_id,
            exclude_id=exclude_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this address type.",
            )

    async def _apply_primary_address(
        self,
        address: AuditEntityAddress,
        updated_by: str,
    ) -> None:
        await self.address_repo.set_other_addresses_non_primary(
            audit_entity_id=address.audit_entity_id,
            exclude_id=address.id,
            updated_by=updated_by,
        )
