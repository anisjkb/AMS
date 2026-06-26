from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_subject_repository import AuditSubjectRepository
from app.schemas.audit_subject import AuditSubjectCreate, AuditSubjectUpdate


class AuditSubjectService:
    def __init__(self, db: AsyncSession):
        self.audit_subject_repo = AuditSubjectRepository(db)

    async def list_audit_subjects(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        subject_type: str | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.audit_subject_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            subject_type=subject_type,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_audit_subject(
        self,
        audit_subject_id: int,
    ):
        subject = await self.audit_subject_repo.get_by_id_any_status(
            audit_subject_id
        )

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit subject not found.",
            )

        return subject

    async def create_audit_subject(
        self,
        payload: AuditSubjectCreate,
        created_by: str,
    ):
        subject_code = payload.subject_code

        if not subject_code:
            subject_code = await self._generate_subject_code()

        existing_code = await self.audit_subject_repo.get_by_code(subject_code)

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Audit subject code already exists.",
            )

        existing_name = await self.audit_subject_repo.get_by_name_and_type(
            subject_name=payload.subject_name,
            subject_type=str(payload.subject_type),
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Audit subject name already exists for this subject type.",
            )

        subject = await self.audit_subject_repo.create(
            payload=payload,
            subject_code=subject_code,
            created_by=created_by,
        )

        return {
            "message": "Audit subject created successfully.",
            "data": subject,
        }

    async def update_audit_subject(
        self,
        audit_subject_id: int,
        payload: AuditSubjectUpdate,
        updated_by: str,
    ):
        subject = await self.audit_subject_repo.get_by_id_any_status(
            audit_subject_id
        )

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit subject not found.",
            )

        subject = await self.audit_subject_repo.update(
            subject=subject,
            payload=payload,
            updated_by=updated_by,
        )

        return {
            "message": "Audit subject updated successfully.",
            "data": subject,
        }

    async def deactivate_audit_subject(
        self,
        audit_subject_id: int,
        updated_by: str,
    ):
        subject = await self.audit_subject_repo.get_by_id_any_status(
            audit_subject_id
        )

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit subject not found.",
            )

        if not subject.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit subject is already inactive.",
            )

        subject = await self.audit_subject_repo.set_active_status(
            subject=subject,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit subject deactivated successfully.",
            "data": subject,
        }

    async def restore_audit_subject(
        self,
        audit_subject_id: int,
        updated_by: str,
    ):
        subject = await self.audit_subject_repo.get_by_id_any_status(
            audit_subject_id
        )

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit subject not found.",
            )

        if subject.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit subject is already active.",
            )

        subject = await self.audit_subject_repo.set_active_status(
            subject=subject,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit subject restored successfully.",
            "data": subject,
        }

    async def permanent_delete_audit_subject(
        self,
        audit_subject_id: int,
    ):
        subject = await self.audit_subject_repo.get_by_id_any_status(
            audit_subject_id
        )

        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit subject not found.",
            )

        await self.audit_subject_repo.permanent_delete(subject)

        return {
            "message": "Audit subject permanently deleted successfully.",
            "data": None,
        }

    async def _generate_subject_code(self) -> str:
        last_subject = await self.audit_subject_repo.get_last_subject()

        if not last_subject:
            return "AS-0001"

        next_id = last_subject.id + 1

        return f"AS-{next_id:04d}"
