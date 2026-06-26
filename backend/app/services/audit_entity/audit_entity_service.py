from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.repositories.audit_entity_repository import AuditEntityRepository
from app.schemas.audit_entity import AuditEntityCreate, AuditEntityUpdate


class AuditEntityService:
    def __init__(self, db: AsyncSession):
        self.audit_entity_repo = AuditEntityRepository(db)

    async def list_audit_entities(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        entity_type: str | None,
        entity_class: str | None,
        parent_entity_id: int | None,
        risk_rating: str | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.audit_entity_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            entity_type=entity_type,
            entity_class=entity_class,
            parent_entity_id=parent_entity_id,
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

    async def get_audit_entity(self, audit_entity_id: int):
        entity = await self.audit_entity_repo.get_by_id_any_status(
            audit_entity_id
        )

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity not found.",
            )

        return entity

    async def create_audit_entity(
        self,
        payload: AuditEntityCreate,
        created_by: str,
    ):
        await self._validate_parent_entity(
            parent_entity_id=payload.parent_entity_id,
            current_entity_id=None,
        )

        payload = await self._sync_legal_status_name_for_create(payload)

        entity_code = payload.entity_code

        if not entity_code:
            entity_code = await self._generate_entity_code()

        existing_code = await self.audit_entity_repo.get_by_code(entity_code)

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Audit entity code already exists.",
            )

        existing_name = await self.audit_entity_repo.get_by_name_and_type(
            entity_name=payload.entity_name,
            entity_type=payload.entity_type,
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Audit entity name already exists for this entity type.",
            )

        entity = await self.audit_entity_repo.create(
            payload=payload,
            entity_code=entity_code,
            created_by=created_by,
        )

        return {
            "message": "Audit entity created successfully.",
            "data": entity,
        }

    async def update_audit_entity(
        self,
        audit_entity_id: int,
        payload: AuditEntityUpdate,
        updated_by: str,
    ):
        entity = await self.audit_entity_repo.get_by_id_any_status(
            audit_entity_id
        )

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity not found.",
            )

        await self._validate_parent_entity_for_update(
            entity=entity,
            payload=payload,
        )

        payload = await self._sync_legal_status_name_for_update(payload)

        if payload.entity_code and payload.entity_code != entity.entity_code:
            existing_code = await self.audit_entity_repo.get_by_code(
                payload.entity_code
            )

            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Audit entity code already exists.",
                )

        next_name = payload.entity_name or entity.entity_name
        next_type = payload.entity_type or entity.entity_type

        existing_name = await self.audit_entity_repo.get_by_name_and_type(
            entity_name=next_name,
            entity_type=next_type,
            exclude_id=entity.id,
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Audit entity name already exists for this entity type.",
            )

        entity = await self.audit_entity_repo.update(
            entity=entity,
            payload=payload,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity updated successfully.",
            "data": entity,
        }

    async def deactivate_audit_entity(
        self,
        audit_entity_id: int,
        updated_by: str,
    ):
        entity = await self.audit_entity_repo.get_by_id_any_status(
            audit_entity_id
        )

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity not found.",
            )

        if not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity is already inactive.",
            )

        entity = await self.audit_entity_repo.set_active_status(
            entity=entity,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity deactivated successfully.",
            "data": entity,
        }

    async def restore_audit_entity(
        self,
        audit_entity_id: int,
        updated_by: str,
    ):
        entity = await self.audit_entity_repo.get_by_id_any_status(
            audit_entity_id
        )

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity not found.",
            )

        if entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity is already active.",
            )

        entity = await self.audit_entity_repo.set_active_status(
            entity=entity,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity restored successfully.",
            "data": entity,
        }

    async def permanent_delete_audit_entity(self, audit_entity_id: int):
        entity = await self.audit_entity_repo.get_by_id_any_status(
            audit_entity_id
        )

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity not found.",
            )

        await self.audit_entity_repo.permanent_delete(entity)

        return {
            "message": "Audit entity permanently deleted successfully.",
            "data": None,
        }

    async def _sync_legal_status_name_for_create(
        self,
        payload: AuditEntityCreate,
    ) -> AuditEntityCreate:
        if payload.legal_status_id is None:
            return payload

        legal_status = await self.audit_entity_repo.get_legal_status_by_id(
            payload.legal_status_id
        )

        if not legal_status or not legal_status.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected legal status is invalid or inactive.",
            )

        return payload.model_copy(
            update={
                "legal_status": legal_status.legal_status_name,
            }
        )

    async def _sync_legal_status_name_for_update(
        self,
        payload: AuditEntityUpdate,
    ) -> AuditEntityUpdate:
        if "legal_status_id" not in payload.model_fields_set:
            return payload

        if payload.legal_status_id is None:
            return payload.model_copy(
                update={
                    "legal_status": None,
                }
            )

        legal_status = await self.audit_entity_repo.get_legal_status_by_id(
            payload.legal_status_id
        )

        if not legal_status or not legal_status.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected legal status is invalid or inactive.",
            )

        return payload.model_copy(
            update={
                "legal_status": legal_status.legal_status_name,
            }
        )

    async def _validate_parent_entity(
        self,
        parent_entity_id: int | None,
        current_entity_id: int | None,
    ) -> None:
        if parent_entity_id is None:
            return

        if current_entity_id is not None and parent_entity_id == current_entity_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity cannot be parent of itself.",
            )

        parent = await self.audit_entity_repo.get_by_id_any_status(parent_entity_id)

        if not parent or not parent.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected parent audit entity is invalid or inactive.",
            )

    async def _validate_parent_entity_for_update(
        self,
        entity: AuditEntity,
        payload: AuditEntityUpdate,
    ) -> None:
        if "parent_entity_id" not in payload.model_fields_set:
            return

        await self._validate_parent_entity(
            parent_entity_id=payload.parent_entity_id,
            current_entity_id=entity.id,
        )

    async def _generate_entity_code(self) -> str:
        last_entity = await self.audit_entity_repo.get_last_entity()

        if not last_entity:
            return "AE-0001"

        next_id = last_entity.id + 1

        return f"AE-{next_id:04d}"
