from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.meeting_master_repository import (
    MeetingMasterRepository,
)
from app.schemas.meeting_master import (
    MeetingMasterCreate,
    MeetingMasterUpdate,
)


class MeetingMasterService:
    def __init__(self, db: AsyncSession):
        self.repository = MeetingMasterRepository(db)

    async def list_meeting_master(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_type: str | None,
        status_filter: str | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            meeting_type=meeting_type,
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

    async def get_meeting_master(
        self,
        meeting_id: int,
    ):
        item = await self.repository.get_by_id(meeting_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Master record not found.",
            )

        return item

    async def _get_audit_reference_fields(
        self,
        audit_id: int,
    ) -> dict:
        audit = (
            await self.repository.get_active_audit_master_by_id(
                audit_id
            )
        )

        if not audit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected Audit Master record is invalid "
                    "or inactive."
                ),
            )

        entity = (
            await self.repository.get_active_audit_entity_by_id(
                audit.client_id
            )
        )

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The client linked with the selected Audit "
                    "Master is invalid or inactive."
                ),
            )

        return {
            "audit_id": audit.audit_id,
            "client_id": audit.client_id,
            "client_code": entity.entity_code,
            "audit_year": audit.audit_year,
            "audit_start_date": audit.audit_start_date,
            "audit_end_date": audit.audit_end_date,
        }

    async def create_meeting_master(
        self,
        payload: MeetingMasterCreate,
        created_by: str,
    ):
        audit_fields = await self._get_audit_reference_fields(
            payload.audit_id
        )

        payload = payload.model_copy(
            update=audit_fields
        )

        item = await self.repository.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": (
                "Meeting Master record created successfully."
            ),
            "data": item,
        }

    async def update_meeting_master(
        self,
        meeting_id: int,
        payload: MeetingMasterUpdate,
        updated_by: str,
    ):
        item = await self.get_meeting_master(meeting_id)

        update_data = payload.model_dump(
            exclude_unset=True
        )

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        resolved_audit_id = update_data.get(
            "audit_id",
            item.audit_id,
        )

        if resolved_audit_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Select an Audit Master record before "
                    "updating this meeting."
                ),
            )

        audit_fields = await self._get_audit_reference_fields(
            resolved_audit_id
        )

        update_data.update(audit_fields)

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": (
                "Meeting Master record updated successfully."
            ),
            "data": updated_item,
        }

    async def deactivate_meeting_master(
        self,
        meeting_id: int,
        updated_by: str,
    ):
        item = await self.get_meeting_master(meeting_id)

        if not item.is_active:
            return {
                "message": (
                    "Meeting Master record is already inactive."
                ),
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": (
                "Meeting Master record deactivated successfully."
            ),
            "data": item,
        }

    async def restore_meeting_master(
        self,
        meeting_id: int,
        updated_by: str,
    ):
        item = await self.get_meeting_master(meeting_id)

        if item.is_active:
            return {
                "message": (
                    "Meeting Master record is already active."
                ),
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": (
                "Meeting Master record restored successfully."
            ),
            "data": item,
        }

    async def permanent_delete_meeting_master(
        self,
        meeting_id: int,
    ):
        item = await self.get_meeting_master(meeting_id)

        await self.repository.permanent_delete(item)

        return {
            "message": (
                "Meeting Master record permanently deleted "
                "successfully."
            ),
            "data": None,
        }
