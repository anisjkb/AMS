from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.legal_status_repository import LegalStatusRepository
from app.schemas.legal_status import LegalStatusCreate, LegalStatusUpdate


class LegalStatusService:
    def __init__(self, db: AsyncSession):
        self.legal_status_repo = LegalStatusRepository(db)

    async def list_legal_statuses(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.legal_status_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_legal_status(
        self,
        legal_status_id: int,
    ):
        legal_status = await self.legal_status_repo.get_by_id_any_status(
            legal_status_id
        )

        if not legal_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Legal status not found.",
            )

        return legal_status

    async def create_legal_status(
        self,
        payload: LegalStatusCreate,
        created_by: str,
    ):
        existing_code = await self.legal_status_repo.get_by_code(
            payload.legal_status_code
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Legal status code already exists.",
            )

        existing_name = await self.legal_status_repo.get_by_name(
            payload.legal_status_name
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Legal status name already exists.",
            )

        legal_status = await self.legal_status_repo.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Legal status created successfully.",
            "data": legal_status,
        }

    async def update_legal_status(
        self,
        legal_status_id: int,
        payload: LegalStatusUpdate,
        updated_by: str,
    ):
        legal_status = await self.legal_status_repo.get_by_id_any_status(
            legal_status_id
        )

        if not legal_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Legal status not found.",
            )

        if (
            payload.legal_status_code
            and payload.legal_status_code != legal_status.legal_status_code
        ):
            existing_code = await self.legal_status_repo.get_by_code(
                payload.legal_status_code
            )

            if existing_code:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Legal status code already exists.",
                )

        if (
            payload.legal_status_name
            and payload.legal_status_name != legal_status.legal_status_name
        ):
            existing_name = await self.legal_status_repo.get_by_name(
                payload.legal_status_name
            )

            if existing_name:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Legal status name already exists.",
                )

        legal_status = await self.legal_status_repo.update(
            legal_status=legal_status,
            payload=payload,
            updated_by=updated_by,
        )

        return {
            "message": "Legal status updated successfully.",
            "data": legal_status,
        }

    async def deactivate_legal_status(
        self,
        legal_status_id: int,
        updated_by: str,
    ):
        legal_status = await self.legal_status_repo.get_by_id_any_status(
            legal_status_id
        )

        if not legal_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Legal status not found.",
            )

        if not legal_status.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Legal status is already inactive.",
            )

        legal_status = await self.legal_status_repo.set_active_status(
            legal_status=legal_status,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Legal status deactivated successfully.",
            "data": legal_status,
        }

    async def restore_legal_status(
        self,
        legal_status_id: int,
        updated_by: str,
    ):
        legal_status = await self.legal_status_repo.get_by_id_any_status(
            legal_status_id
        )

        if not legal_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Legal status not found.",
            )

        if legal_status.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Legal status is already active.",
            )

        legal_status = await self.legal_status_repo.set_active_status(
            legal_status=legal_status,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Legal status restored successfully.",
            "data": legal_status,
        }

    async def permanent_delete_legal_status(
        self,
        legal_status_id: int,
    ):
        legal_status = await self.legal_status_repo.get_by_id_any_status(
            legal_status_id
        )

        if not legal_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Legal status not found.",
            )

        await self.legal_status_repo.permanent_delete(legal_status)

        return {
            "message": "Legal status permanently deleted successfully.",
            "data": None,
        }
