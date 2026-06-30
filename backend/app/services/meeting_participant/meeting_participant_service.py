from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.meeting_participant_repository import (
    MeetingParticipantRepository,
)
from app.schemas.meeting_participant import (
    MeetingParticipantCreate,
    MeetingParticipantUpdate,
)


class MeetingParticipantService:
    def __init__(self, db: AsyncSession):
        self.repository = MeetingParticipantRepository(db)

    async def list_meeting_participants(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        report_id: int | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            report_id=report_id,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_meeting_participant(self, participant_id: int):
        item = await self.repository.get_by_id(participant_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Participant record not found.",
            )

        return item

    async def _validate_report(self, report_id: int) -> None:
        report = await self.repository.get_active_report_by_id(report_id)

        if not report:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Meeting Report is invalid or inactive.",
            )

    async def create_meeting_participant(
        self,
        payload: MeetingParticipantCreate,
        created_by: str,
    ):
        await self._validate_report(payload.report_id)

        item = await self.repository.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Meeting Participant record created successfully.",
            "data": item,
        }

    async def update_meeting_participant(
        self,
        participant_id: int,
        payload: MeetingParticipantUpdate,
        updated_by: str,
    ):
        item = await self.get_meeting_participant(participant_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "report_id" in update_data:
            await self._validate_report(update_data["report_id"])

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Participant record updated successfully.",
            "data": updated_item,
        }

    async def deactivate_meeting_participant(
        self,
        participant_id: int,
        updated_by: str,
    ):
        item = await self.get_meeting_participant(participant_id)

        if not item.is_active:
            return {
                "message": "Meeting Participant record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Participant record deactivated successfully.",
            "data": item,
        }

    async def restore_meeting_participant(
        self,
        participant_id: int,
        updated_by: str,
    ):
        item = await self.get_meeting_participant(participant_id)

        if item.is_active:
            return {
                "message": "Meeting Participant record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Participant record restored successfully.",
            "data": item,
        }

    async def permanent_delete_meeting_participant(self, participant_id: int):
        item = await self.get_meeting_participant(participant_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Meeting Participant record permanently deleted successfully.",
            "data": None,
        }
