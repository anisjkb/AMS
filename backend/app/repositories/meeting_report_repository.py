from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.meeting_master import MeetingMaster
from app.models.meeting_report import MeetingReport


class MeetingReportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        audit_year: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    MeetingReport.meeting_type.ilike(search_term),
                    MeetingReport.client_name.ilike(search_term),
                    MeetingReport.audit_year.ilike(search_term),
                    MeetingReport.location.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(MeetingReport.is_active == is_active)

        if meeting_id is not None:
            filters.append(MeetingReport.meeting_id == meeting_id)

        if audit_year:
            filters.append(MeetingReport.audit_year == audit_year)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "report_id": MeetingReport.report_id,
            "meeting_id": MeetingReport.meeting_id,
            "meeting_type": MeetingReport.meeting_type,
            "client_name": MeetingReport.client_name,
            "audit_year": MeetingReport.audit_year,
            "meeting_date": MeetingReport.meeting_date,
            "location": MeetingReport.location,
            "created_at": MeetingReport.created_at,
            "updated_at": MeetingReport.updated_at,
        }

        return allowed_sort_columns.get(sort_by, MeetingReport.report_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        audit_year: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[MeetingReport], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            meeting_id=meeting_id,
            audit_year=audit_year,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(MeetingReport)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(MeetingReport).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, report_id: int) -> MeetingReport | None:
        result = await self.db.execute(
            select(MeetingReport).where(MeetingReport.report_id == report_id)
        )
        return result.scalar_one_or_none()

    async def get_by_meeting_id(
        self,
        meeting_id: int,
        exclude_report_id: int | None = None,
    ) -> MeetingReport | None:
        stmt = select(MeetingReport).where(MeetingReport.meeting_id == meeting_id)

        if exclude_report_id is not None:
            stmt = stmt.where(MeetingReport.report_id != exclude_report_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_meeting_master_by_id(
        self,
        meeting_id: int,
    ) -> MeetingMaster | None:
        result = await self.db.execute(
            select(MeetingMaster).where(
                MeetingMaster.meeting_id == meeting_id,
                MeetingMaster.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_active_audit_entity_by_id(
        self,
        audit_entity_id: int,
    ) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).where(
                AuditEntity.id == audit_entity_id,
                AuditEntity.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        data: dict,
        created_by: str,
    ) -> MeetingReport:
        item = MeetingReport(
            **data,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def update(
        self,
        item: MeetingReport,
        data: dict,
        updated_by: str,
    ) -> MeetingReport:
        for field, value in data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: MeetingReport,
        updated_by: str,
    ) -> MeetingReport:
        item.is_active = False
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: MeetingReport,
        updated_by: str,
    ) -> MeetingReport:
        item.is_active = True
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: MeetingReport) -> None:
        await self.db.delete(item)
        await self.db.commit()
