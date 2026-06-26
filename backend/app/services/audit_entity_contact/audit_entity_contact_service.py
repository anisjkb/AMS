from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity_contact import AuditEntityContact
from app.repositories.audit_entity_contact_repository import (
    AuditEntityContactRepository,
)
from app.schemas.audit_entity_contact import (
    AuditEntityContactCreate,
    AuditEntityContactUpdate,
)


class AuditEntityContactService:
    def __init__(self, db: AsyncSession):
        self.contact_repo = AuditEntityContactRepository(db)

    async def list_contact_types(
        self,
        is_active: bool | None,
    ):
        total, items = await self.contact_repo.list_contact_types(is_active)

        return {
            "total": total,
            "items": items,
        }

    async def list_contacts(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        contact_type_id: int | None,
        is_primary: bool | None,
        is_authorized_representative: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.contact_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            contact_type_id=contact_type_id,
            is_primary=is_primary,
            is_authorized_representative=is_authorized_representative,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_contact(
        self,
        contact_id: int,
    ):
        contact = await self.contact_repo.get_by_id_any_status(contact_id)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity contact not found.",
            )

        return contact

    async def create_contact(
        self,
        payload: AuditEntityContactCreate,
        created_by: str,
    ):
        await self._validate_audit_entity(payload.audit_entity_id)
        await self._validate_contact_type(payload.contact_type_id)

        await self._validate_duplicate_contact(
            audit_entity_id=payload.audit_entity_id,
            contact_name=payload.contact_name,
            email=str(payload.email) if payload.email else None,
            mobile=payload.mobile,
            exclude_id=None,
        )

        contact = await self.contact_repo.create(
            payload=payload,
            created_by=created_by,
        )

        if contact.is_primary:
            await self._apply_primary_contact(
                contact=contact,
                updated_by=created_by,
            )

        return {
            "message": "Audit entity contact created successfully.",
            "data": contact,
        }

    async def update_contact(
        self,
        contact_id: int,
        payload: AuditEntityContactUpdate,
        updated_by: str,
    ):
        contact = await self.contact_repo.get_by_id_any_status(contact_id)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity contact not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else contact.audit_entity_id
        )
        next_contact_type_id = (
            payload.contact_type_id
            if "contact_type_id" in fields_set and payload.contact_type_id is not None
            else contact.contact_type_id
        )
        next_contact_name = (
            payload.contact_name
            if "contact_name" in fields_set and payload.contact_name is not None
            else contact.contact_name
        )
        next_email = (
            str(payload.email)
            if "email" in fields_set and payload.email is not None
            else contact.email
        )
        next_mobile = (
            payload.mobile
            if "mobile" in fields_set and payload.mobile is not None
            else contact.mobile
        )
        next_is_primary = (
            payload.is_primary
            if "is_primary" in fields_set and payload.is_primary is not None
            else contact.is_primary
        )

        await self._validate_audit_entity(next_entity_id)
        await self._validate_contact_type(next_contact_type_id)

        await self._validate_duplicate_contact(
            audit_entity_id=next_entity_id,
            contact_name=next_contact_name,
            email=next_email,
            mobile=next_mobile,
            exclude_id=contact.id,
        )

        contact = await self.contact_repo.update(
            contact=contact,
            payload=payload,
            updated_by=updated_by,
        )

        if next_is_primary:
            await self._apply_primary_contact(
                contact=contact,
                updated_by=updated_by,
            )

        return {
            "message": "Audit entity contact updated successfully.",
            "data": contact,
        }

    async def deactivate_contact(
        self,
        contact_id: int,
        updated_by: str,
    ):
        contact = await self.contact_repo.get_by_id_any_status(contact_id)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity contact not found.",
            )

        if not contact.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity contact is already inactive.",
            )

        contact = await self.contact_repo.set_active_status(
            contact=contact,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity contact deactivated successfully.",
            "data": contact,
        }

    async def restore_contact(
        self,
        contact_id: int,
        updated_by: str,
    ):
        contact = await self.contact_repo.get_by_id_any_status(contact_id)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity contact not found.",
            )

        if contact.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity contact is already active.",
            )

        contact = await self.contact_repo.set_active_status(
            contact=contact,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity contact restored successfully.",
            "data": contact,
        }

    async def permanent_delete_contact(
        self,
        contact_id: int,
    ):
        contact = await self.contact_repo.get_by_id_any_status(contact_id)

        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity contact not found.",
            )

        await self.contact_repo.permanent_delete(contact)

        return {
            "message": "Audit entity contact permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.contact_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_contact_type(
        self,
        contact_type_id: int,
    ) -> None:
        contact_type = await self.contact_repo.get_contact_type_by_id(
            contact_type_id
        )

        if not contact_type or not contact_type.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected contact type is invalid or inactive.",
            )

    async def _validate_duplicate_contact(
        self,
        audit_entity_id: int,
        contact_name: str,
        email: str | None,
        mobile: str | None,
        exclude_id: int | None,
    ) -> None:
        existing = await self.contact_repo.get_duplicate_contact(
            audit_entity_id=audit_entity_id,
            contact_name=contact_name,
            email=email,
            mobile=mobile,
            exclude_id=exclude_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this contact.",
            )

    async def _apply_primary_contact(
        self,
        contact: AuditEntityContact,
        updated_by: str,
    ) -> None:
        await self.contact_repo.set_other_contacts_non_primary(
            audit_entity_id=contact.audit_entity_id,
            exclude_id=contact.id,
            updated_by=updated_by,
        )
