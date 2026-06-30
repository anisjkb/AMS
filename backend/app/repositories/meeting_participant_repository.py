from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_participant import MeetingParticipant
from app.models.meeting_report import MeetingReport
from app.schemas.meeting_participant import MeetingParticipantCreate


class MeetingParticipantRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        report_id: int | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    MeetingParticipant.name.ilike(search_term),
                    MeetingParticipant.designation.ilike(search_term),
                    MeetingParticipant.signature.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(MeetingParticipant.is_active == is_active)

        if report_id is not None:
            filters.append(MeetingParticipant.report_id == report_id)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "participant_id": MeetingParticipant.participant_id,
            "report_id": MeetingParticipant.report_id,
            "name": MeetingParticipant.name,
            "designation": MeetingParticipant.designation,
            "created_at": MeetingParticipant.created_at,
            "updated_at": MeetingParticipant.updated_at,
        }

        return allowed_sort_columns.get(sort_by, MeetingParticipant.participant_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        report_id: int | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[MeetingParticipant], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            report_id=report_id,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(MeetingParticipant)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(MeetingParticipant).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, participant_id: int) -> MeetingParticipant | None:
        result = await self.db.execute(
            select(MeetingParticipant).where(
                MeetingParticipant.participant_id == participant_id
            )
        )
        return result.scalar_one_or_none()

    async def get_active_report_by_id(self, report_id: int) -> MeetingReport | None:
        result = await self.db.execute(
            select(MeetingReport).where(
                MeetingReport.report_id == report_id,
                MeetingReport.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: MeetingParticipantCreate,
        created_by: str,
    ) -> MeetingParticipant:
        item = MeetingParticipant(
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
        item: MeetingParticipant,
        update_data: dict,
        updated_by: str,
    ) -> MeetingParticipant:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: MeetingParticipant,
        updated_by: str,
    ) -> MeetingParticipant:
        item.is_active = False
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: MeetingParticipant,
        updated_by: str,
    ) -> MeetingParticipant:
        item.is_active = True
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: MeetingParticipant) -> None:
        await self.db.delete(item)
        await self.db.commit()
