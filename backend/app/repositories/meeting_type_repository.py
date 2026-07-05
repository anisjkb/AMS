from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_type import MeetingType


class MeetingTypeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        sort_by: str = "meeting_type_id",
        sort_order: str = "desc",
        is_active: bool | None = None,
    ) -> tuple[int, list[MeetingType]]:
        allowed_sort_fields = {
            "meeting_type_id": MeetingType.meeting_type_id,
            "meeting_type_name": MeetingType.meeting_type_name,
            "status": MeetingType.status,
            "created_at": MeetingType.created_at,
            "updated_at": MeetingType.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, MeetingType.meeting_type_id)
        order_column = asc(sort_column) if sort_order.lower() == "asc" else desc(sort_column)

        filters = []

        if is_active is not None:
            filters.append(MeetingType.is_active == is_active)

        if search:
            search_pattern = f"%{search.strip()}%"
            filters.append(
                or_(
                    MeetingType.meeting_type_name.ilike(search_pattern),
                    MeetingType.description.ilike(search_pattern),
                    MeetingType.status.ilike(search_pattern),
                )
            )

        count_query = select(func.count()).select_from(MeetingType)
        query = select(MeetingType)

        if filters:
            count_query = count_query.where(*filters)
            query = query.where(*filters)

        total_result = await self.db.execute(count_query)
        total = int(total_result.scalar_one())

        result = await self.db.execute(
            query.order_by(order_column)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return total, list(result.scalars().all())

    async def get_by_id(self, meeting_type_id: int) -> MeetingType | None:
        result = await self.db.execute(
            select(MeetingType).where(MeetingType.meeting_type_id == meeting_type_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, meeting_type_name: str) -> MeetingType | None:
        result = await self.db.execute(
            select(MeetingType).where(
                func.lower(MeetingType.meeting_type_name) == meeting_type_name.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(self, item: MeetingType) -> MeetingType:
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update(self, item: MeetingType) -> MeetingType:
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete(self, item: MeetingType) -> None:
        await self.db.delete(item)
        await self.db.commit()
