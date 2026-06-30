from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_master import MeetingMaster
from app.repositories.meeting_report_repository import MeetingReportRepository
from app.schemas.meeting_report import MeetingReportCreate, MeetingReportUpdate


class MeetingReportService:
    def __init__(self, db: AsyncSession):
        self.repository = MeetingReportRepository(db)

    async def list_meeting_reports(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        audit_year: str | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            meeting_id=meeting_id,
            audit_year=audit_year,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_meeting_report(self, report_id: int):
        item = await self.repository.get_by_id(report_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Report record not found.",
            )

        return item

    async def _build_report_data_from_meeting(
        self,
        meeting_id: int,
        location_override: str | None = None,
    ) -> dict:
        meeting = await self.repository.get_active_meeting_master_by_id(meeting_id)

        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Meeting Master record is invalid or inactive.",
            )

        client_name = await self._get_client_name(meeting)

        return {
            "meeting_id": meeting.meeting_id,
            "meeting_type": meeting.meeting_type,
            "client_name": client_name,
            "audit_year": meeting.audit_year,
            "meeting_date": meeting.meeting_date,
            "location": location_override or meeting.meeting_venue,
        }

    async def _get_client_name(self, meeting: MeetingMaster) -> str:
        entity = await self.repository.get_active_audit_entity_by_id(meeting.client_id)

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Meeting Master client/entity is invalid or inactive.",
            )

        return entity.entity_name

    async def create_meeting_report(
        self,
        payload: MeetingReportCreate,
        created_by: str,
    ):
        existing = await self.repository.get_by_meeting_id(payload.meeting_id)

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Meeting Report already exists for this Meeting Master record.",
            )

        data = await self._build_report_data_from_meeting(
            meeting_id=payload.meeting_id,
            location_override=payload.location,
        )

        item = await self.repository.create(
            data=data,
            created_by=created_by,
        )

        return {
            "message": "Meeting Report record created successfully.",
            "data": item,
        }

    async def update_meeting_report(
        self,
        report_id: int,
        payload: MeetingReportUpdate,
        updated_by: str,
    ):
        item = await self.get_meeting_report(report_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        data: dict = {}

        if "meeting_id" in update_data:
            existing = await self.repository.get_by_meeting_id(
                meeting_id=update_data["meeting_id"],
                exclude_report_id=report_id,
            )

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Meeting Report already exists for this Meeting Master record.",
                )

            data.update(
                await self._build_report_data_from_meeting(
                    meeting_id=update_data["meeting_id"],
                    location_override=update_data.get("location"),
                )
            )
        elif "location" in update_data:
            data["location"] = update_data["location"]

        if "is_active" in update_data:
            data["is_active"] = update_data["is_active"]

        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid update data provided.",
            )

        item = await self.repository.update(
            item=item,
            data=data,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Report record updated successfully.",
            "data": item,
        }

    async def deactivate_meeting_report(
        self,
        report_id: int,
        updated_by: str,
    ):
        item = await self.get_meeting_report(report_id)

        if not item.is_active:
            return {
                "message": "Meeting Report record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Report record deactivated successfully.",
            "data": item,
        }

    async def restore_meeting_report(
        self,
        report_id: int,
        updated_by: str,
    ):
        item = await self.get_meeting_report(report_id)

        if item.is_active:
            return {
                "message": "Meeting Report record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Report record restored successfully.",
            "data": item,
        }

    async def permanent_delete_meeting_report(self, report_id: int):
        item = await self.get_meeting_report(report_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Meeting Report record permanently deleted successfully.",
            "data": None,
        }
