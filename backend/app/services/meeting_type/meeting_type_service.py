from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_type import MeetingType
from app.repositories.meeting_type_repository import MeetingTypeRepository
from app.schemas.meeting_type import (
    MeetingTypeCreate,
    MeetingTypeListResponse,
    MeetingTypeMessageResponse,
    MeetingTypeUpdate,
)


class MeetingTypeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = MeetingTypeRepository(db)

    async def list_meeting_type(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        sort_by: str = "meeting_type_id",
        sort_order: str = "desc",
        is_active: bool | None = None,
    ) -> MeetingTypeListResponse:
        total, items = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            is_active=is_active,
        )

        return MeetingTypeListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=items,
        )

    async def get_meeting_type(self, meeting_type_id: int) -> MeetingType:
        item = await self.repository.get_by_id(meeting_type_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting type not found.",
            )
        return item

    async def create_meeting_type(
        self,
        payload: MeetingTypeCreate,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        existing = await self.repository.get_by_name(payload.meeting_type_name)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Meeting type name already exists.",
            )

        item = MeetingType(**payload.model_dump())
        if username:
            item.created_by = username
            item.updated_by = username

        created = await self.repository.create(item)
        return MeetingTypeMessageResponse(
            message="Meeting type created successfully.",
            data=created,
        )

    async def update_meeting_type(
        self,
        meeting_type_id: int,
        payload: MeetingTypeUpdate,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        data = payload.model_dump(exclude_unset=True)

        if "meeting_type_name" in data and data["meeting_type_name"]:
            existing = await self.repository.get_by_name(data["meeting_type_name"])
            if existing is not None and existing.meeting_type_id != meeting_type_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Meeting type name already exists.",
                )

        for field, value in data.items():
            setattr(item, field, value)

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return MeetingTypeMessageResponse(
            message="Meeting type updated successfully.",
            data=updated,
        )

    async def deactivate_meeting_type(
        self,
        meeting_type_id: int,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        item.is_active = False
        item.status = "inactive"

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return MeetingTypeMessageResponse(
            message="Meeting type inactivated successfully.",
            data=updated,
        )

    async def restore_meeting_type(
        self,
        meeting_type_id: int,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        item.is_active = True
        item.status = "active"

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return MeetingTypeMessageResponse(
            message="Meeting type restored successfully.",
            data=updated,
        )

    async def permanent_delete_meeting_type(self, meeting_type_id: int) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        await self.repository.delete(item)
        return MeetingTypeMessageResponse(
            message="Meeting type permanently deleted successfully.",
            data=None,
        )
