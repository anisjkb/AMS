from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity_director import AuditEntityDirector
from app.repositories.audit_entity_director_repository import (
    AuditEntityDirectorRepository,
)
from app.schemas.audit_entity_director import (
    AuditEntityDirectorCreate,
    AuditEntityDirectorUpdate,
)


class AuditEntityDirectorService:
    def __init__(self, db: AsyncSession):
        self.director_repo = AuditEntityDirectorRepository(db)

    async def list_director_types(
        self,
        is_active: bool | None,
    ):
        total, items = await self.director_repo.list_director_types(is_active)

        return {
            "total": total,
            "items": items,
        }

    async def list_directors(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        director_type_id: int | None,
        is_primary: bool | None,
        is_signatory: bool | None,
        is_beneficial_owner: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.director_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            director_type_id=director_type_id,
            is_primary=is_primary,
            is_signatory=is_signatory,
            is_beneficial_owner=is_beneficial_owner,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_director(
        self,
        director_id: int,
    ):
        director = await self.director_repo.get_by_id_any_status(director_id)

        if not director:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity director/owner not found.",
            )

        return director

    async def create_director(
        self,
        payload: AuditEntityDirectorCreate,
        created_by: str,
    ):
        await self._validate_audit_entity(payload.audit_entity_id)
        await self._validate_director_type(payload.director_type_id)

        await self._validate_duplicate_director(
            audit_entity_id=payload.audit_entity_id,
            person_name=payload.person_name,
            nid_no=payload.nid_no,
            passport_no=payload.passport_no,
            mobile=payload.mobile,
            exclude_id=None,
        )

        director = await self.director_repo.create(
            payload=payload,
            created_by=created_by,
        )

        if director.is_primary:
            await self._apply_primary_director(
                director=director,
                updated_by=created_by,
            )

        return {
            "message": "Audit entity director/owner created successfully.",
            "data": director,
        }

    async def update_director(
        self,
        director_id: int,
        payload: AuditEntityDirectorUpdate,
        updated_by: str,
    ):
        director = await self.director_repo.get_by_id_any_status(director_id)

        if not director:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity director/owner not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else director.audit_entity_id
        )
        next_director_type_id = (
            payload.director_type_id
            if "director_type_id" in fields_set and payload.director_type_id is not None
            else director.director_type_id
        )
        next_person_name = (
            payload.person_name
            if "person_name" in fields_set and payload.person_name is not None
            else director.person_name
        )
        next_nid_no = (
            payload.nid_no
            if "nid_no" in fields_set
            else director.nid_no
        )
        next_passport_no = (
            payload.passport_no
            if "passport_no" in fields_set
            else director.passport_no
        )
        next_mobile = (
            payload.mobile
            if "mobile" in fields_set
            else director.mobile
        )
        next_is_primary = (
            payload.is_primary
            if "is_primary" in fields_set and payload.is_primary is not None
            else director.is_primary
        )

        await self._validate_audit_entity(next_entity_id)
        await self._validate_director_type(next_director_type_id)

        await self._validate_duplicate_director(
            audit_entity_id=next_entity_id,
            person_name=next_person_name,
            nid_no=next_nid_no,
            passport_no=next_passport_no,
            mobile=next_mobile,
            exclude_id=director.id,
        )

        director = await self.director_repo.update(
            director=director,
            payload=payload,
            updated_by=updated_by,
        )

        if next_is_primary:
            await self._apply_primary_director(
                director=director,
                updated_by=updated_by,
            )

        return {
            "message": "Audit entity director/owner updated successfully.",
            "data": director,
        }

    async def deactivate_director(
        self,
        director_id: int,
        updated_by: str,
    ):
        director = await self.director_repo.get_by_id_any_status(director_id)

        if not director:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity director/owner not found.",
            )

        if not director.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity director/owner is already inactive.",
            )

        director = await self.director_repo.set_active_status(
            director=director,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity director/owner deactivated successfully.",
            "data": director,
        }

    async def restore_director(
        self,
        director_id: int,
        updated_by: str,
    ):
        director = await self.director_repo.get_by_id_any_status(director_id)

        if not director:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity director/owner not found.",
            )

        if director.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity director/owner is already active.",
            )

        director = await self.director_repo.set_active_status(
            director=director,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity director/owner restored successfully.",
            "data": director,
        }

    async def permanent_delete_director(
        self,
        director_id: int,
    ):
        director = await self.director_repo.get_by_id_any_status(director_id)

        if not director:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity director/owner not found.",
            )

        await self.director_repo.permanent_delete(director)

        return {
            "message": "Audit entity director/owner permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.director_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_director_type(
        self,
        director_type_id: int,
    ) -> None:
        director_type = await self.director_repo.get_director_type_by_id(
            director_type_id
        )

        if not director_type or not director_type.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected director/owner type is invalid or inactive.",
            )

    async def _validate_duplicate_director(
        self,
        audit_entity_id: int,
        person_name: str,
        nid_no: str | None,
        passport_no: str | None,
        mobile: str | None,
        exclude_id: int | None,
    ) -> None:
        existing = await self.director_repo.get_duplicate_director(
            audit_entity_id=audit_entity_id,
            person_name=person_name,
            nid_no=nid_no,
            passport_no=passport_no,
            mobile=mobile,
            exclude_id=exclude_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this director/owner.",
            )

    async def _apply_primary_director(
        self,
        director: AuditEntityDirector,
        updated_by: str,
    ) -> None:
        await self.director_repo.set_other_directors_non_primary(
            audit_entity_id=director.audit_entity_id,
            exclude_id=director.id,
            updated_by=updated_by,
        )
