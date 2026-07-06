from fastapi import HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.meeting_participant_repository import MeetingParticipantRepository
from app.schemas.meeting_participant import MeetingParticipantCreate


class MeetingParticipantService:
    def __init__(self, db: AsyncSession):
        self.repository = MeetingParticipantRepository(db)

    async def list_meeting_participants(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        total, items = await self.repository.list_participants(
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

    async def get_meeting_participant(self, participant_id: int):
        item = await self.repository.get_by_id(participant_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Participant record not found.",
            )
        return item

    async def list_internal_team_options(self):
        return {"items": await self.repository.list_internal_team_options()}

    async def list_entity_contact_options(self, meeting_id: int):
        meeting = await self.repository.get_meeting(meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Master record not found.",
            )

        return {"items": await self.repository.list_entity_contact_options(meeting_id)}

    async def create_meeting_participant(
        self,
        payload: MeetingParticipantCreate,
        created_by: str | None,
    ):
        meeting = await self.repository.get_meeting(payload.meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Master record not found.",
            )

        if payload.source_type == "internal_audit_team":
            items = await self.repository.create_from_internal_team(
                meeting_id=payload.meeting_id,
                audit_team_id=payload.audit_team_id or 0,
                created_by=created_by,
            )
            if not items:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No active team members found, or selected members already exist for this meeting.",
                )

            return {
                "message": "Meeting participants added from Internal Audit Team successfully.",
                "data": items,
            }

        items = await self.repository.create_from_entity_contact(
            meeting_id=payload.meeting_id,
            entity_contact_id=payload.entity_contact_id or 0,
            created_by=created_by,
        )
        if not items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Entity contact not found for the selected meeting entity, or participant already exists.",
            )

        return {
            "message": "Meeting participant added from Client/Entity Team successfully.",
            "data": items,
        }

    async def deactivate_meeting_participant(
        self,
        participant_id: int,
        updated_by: str | None,
    ):
        existing = await self.get_meeting_participant(participant_id)

        item = await self.repository.update_is_active(
            participant_id=participant_id,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Participant record deactivated successfully.",
            "data": item or existing,
        }

    async def restore_meeting_participant(
        self,
        participant_id: int,
        updated_by: str | None,
    ):
        existing = await self.get_meeting_participant(participant_id)

        item = await self.repository.update_is_active(
            participant_id=participant_id,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Participant record restored successfully.",
            "data": item or existing,
        }

    async def permanent_delete_meeting_participant(self, participant_id: int):
        await self.get_meeting_participant(participant_id)

        deleted = await self.repository.permanent_delete(participant_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Participant record not found.",
            )

        return {
            "message": "Meeting Participant record permanently deleted successfully.",
            "data": None,
        }
