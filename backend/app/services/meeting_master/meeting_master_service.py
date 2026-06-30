from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.meeting_master_repository import MeetingMasterRepository
from app.schemas.meeting_master import MeetingMasterCreate, MeetingMasterUpdate


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

    async def get_meeting_master(self, meeting_id: int):
        item = await self.repository.get_by_id(meeting_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting Master record not found.",
            )

        return item

    async def create_meeting_master(
        self,
        payload: MeetingMasterCreate,
        created_by: str,
    ):
        item = await self.repository.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Meeting Master record created successfully.",
            "data": item,
        }

    async def update_meeting_master(
        self,
        meeting_id: int,
        payload: MeetingMasterUpdate,
        updated_by: str,
    ):
        item = await self.get_meeting_master(meeting_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        audit_start_date = update_data.get("audit_start_date", item.audit_start_date)
        audit_end_date = update_data.get("audit_end_date", item.audit_end_date)

        if audit_end_date < audit_start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit end date cannot be before audit start date.",
            )

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Master record updated successfully.",
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
                "message": "Meeting Master record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Master record deactivated successfully.",
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
                "message": "Meeting Master record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Meeting Master record restored successfully.",
            "data": item,
        }

    async def permanent_delete_meeting_master(self, meeting_id: int):
        item = await self.get_meeting_master(meeting_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Meeting Master record permanently deleted successfully.",
            "data": None,
        }
