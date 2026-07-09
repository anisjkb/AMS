from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.meeting_minute.entrance_meeting_minute_repository import (
    EntranceMeetingMinuteRepository,
)
from app.schemas.meeting_minute.entrance_meeting_minute import (
    EntranceMeetingMinuteCreate,
    EntranceMeetingMinuteUpdate,
)


class EntranceMeetingMinuteService:
    def __init__(self, db: AsyncSession):
        self.repository = EntranceMeetingMinuteRepository(db)

    async def list_entrance_meeting_minutes(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            meeting_id=meeting_id,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_entrance_meeting_minute(self, minute_id: int):
        item = await self.repository.get_by_id(minute_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrance Meeting Minutes record not found.",
            )

        return item

    async def _validate_meeting_and_chairman(
        self,
        meeting_id: int,
        chairman_participant_id: int,
    ):
        meeting = await self.repository.get_active_meeting(meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Meeting Master record is invalid or inactive.",
            )

        chairman = await self.repository.get_active_participant_for_meeting(
            participant_id=chairman_participant_id,
            meeting_id=meeting_id,
        )

        if not chairman:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected chairman must be an active participant of the selected meeting.",
            )

    async def create_entrance_meeting_minute(
        self,
        payload: EntranceMeetingMinuteCreate,
        created_by: str | None,
    ):
        await self._validate_meeting_and_chairman(
            meeting_id=payload.meeting_id,
            chairman_participant_id=payload.chairman_participant_id,
        )

        item = await self.repository.create(
            data=payload.model_dump(),
            created_by=created_by,
        )

        return {
            "message": "Entrance Meeting Minutes record created successfully.",
            "data": item,
        }

    async def update_entrance_meeting_minute(
        self,
        minute_id: int,
        payload: EntranceMeetingMinuteUpdate,
        updated_by: str | None,
    ):
        existing = await self.get_entrance_meeting_minute(minute_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        meeting_id = update_data.get("meeting_id", existing["meeting_id"])
        chairman_participant_id = update_data.get(
            "chairman_participant_id",
            existing["chairman_participant_id"],
        )

        await self._validate_meeting_and_chairman(
            meeting_id=meeting_id,
            chairman_participant_id=chairman_participant_id,
        )

        item = await self.repository.update(
            minute_id=minute_id,
            data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Entrance Meeting Minutes record updated successfully.",
            "data": item,
        }

    async def deactivate_entrance_meeting_minute(
        self,
        minute_id: int,
        updated_by: str | None,
    ):
        await self.get_entrance_meeting_minute(minute_id)

        item = await self.repository.update_is_active(
            minute_id=minute_id,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Entrance Meeting Minutes record deactivated successfully.",
            "data": item,
        }

    async def restore_entrance_meeting_minute(
        self,
        minute_id: int,
        updated_by: str | None,
    ):
        await self.get_entrance_meeting_minute(minute_id)

        item = await self.repository.update_is_active(
            minute_id=minute_id,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Entrance Meeting Minutes record restored successfully.",
            "data": item,
        }

    async def permanent_delete_entrance_meeting_minute(self, minute_id: int):
        await self.get_entrance_meeting_minute(minute_id)

        deleted = await self.repository.permanent_delete(minute_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrance Meeting Minutes record not found.",
            )

        return {
            "message": "Entrance Meeting Minutes record permanently deleted successfully.",
            "data": None,
        }

    async def get_report(self, minute_id: int):
        minute = await self.get_entrance_meeting_minute(minute_id)

        internal_participants = await self.repository.list_report_participants(
            meeting_id=minute["meeting_id"],
            source_type="internal_audit_team",
        )

        client_participants = await self.repository.list_report_participants(
            meeting_id=minute["meeting_id"],
            source_type="client_entity_team",
        )

        discussions = await self.repository.list_report_discussions(
            audit_type=minute["meeting_type"] or "",
        )

        offices = await self.repository.list_report_offices(
            client_id=minute["client_id"] or 0,
        )

        return {
            "minute": minute,
            "internal_participants": internal_participants,
            "client_participants": client_participants,
            "discussions": discussions,
            "offices": offices,
        }
