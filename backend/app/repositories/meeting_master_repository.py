from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_master import MeetingMaster
from app.schemas.meeting_master import MeetingMasterCreate


class MeetingMasterRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        meeting_type: str | None,
        status: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    MeetingMaster.meeting_type.ilike(search_term),
                    MeetingMaster.client_code.ilike(search_term),
                    MeetingMaster.audit_year.ilike(search_term),
                    MeetingMaster.meeting_venue.ilike(search_term),
                    MeetingMaster.status.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(MeetingMaster.is_active == is_active)

        if meeting_type:
            filters.append(MeetingMaster.meeting_type == meeting_type)

        if status:
            filters.append(MeetingMaster.status == status)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "meeting_id": MeetingMaster.meeting_id,
            "meeting_type": MeetingMaster.meeting_type,
            "client_id": MeetingMaster.client_id,
            "client_code": MeetingMaster.client_code,
            "audit_year": MeetingMaster.audit_year,
            "meeting_date": MeetingMaster.meeting_date,
            "audit_start_date": MeetingMaster.audit_start_date,
            "audit_end_date": MeetingMaster.audit_end_date,
            "meeting_venue": MeetingMaster.meeting_venue,
            "status": MeetingMaster.status,
            "created_at": MeetingMaster.created_at,
            "updated_at": MeetingMaster.updated_at,
        }

        return allowed_sort_columns.get(sort_by, MeetingMaster.meeting_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_type: str | None,
        status: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[MeetingMaster], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            meeting_type=meeting_type,
            status=status,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(MeetingMaster)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(MeetingMaster).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, meeting_id: int) -> MeetingMaster | None:
        result = await self.db.execute(
            select(MeetingMaster).where(MeetingMaster.meeting_id == meeting_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: MeetingMasterCreate,
        created_by: str,
    ) -> MeetingMaster:
        item = MeetingMaster(
            **payload.model_dump(),
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def update(
        self,
        item: MeetingMaster,
        update_data: dict,
        updated_by: str,
    ) -> MeetingMaster:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: MeetingMaster,
        updated_by: str,
    ) -> MeetingMaster:
        item.is_active = False
        item.status = "inactive"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: MeetingMaster,
        updated_by: str,
    ) -> MeetingMaster:
        item.is_active = True
        item.status = "active"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: MeetingMaster) -> None:
        await self.db.delete(item)
        await self.db.commit()
