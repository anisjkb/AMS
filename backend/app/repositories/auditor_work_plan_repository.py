from sqlalchemy import and_, cast, func, or_, select, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auditor_work_plan import AuditorWorkPlan
from app.models.meeting_report import MeetingReport


class AuditorWorkPlanRepository:
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
                    AuditorWorkPlan.work_plan_details.ilike(search_term),
                    cast(AuditorWorkPlan.plan_id, String).ilike(search_term),
                    cast(AuditorWorkPlan.report_id, String).ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(AuditorWorkPlan.is_active == is_active)

        if report_id is not None:
            filters.append(AuditorWorkPlan.report_id == report_id)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "plan_id": AuditorWorkPlan.plan_id,
            "report_id": AuditorWorkPlan.report_id,
            "work_plan_details": AuditorWorkPlan.work_plan_details,
            "created_at": AuditorWorkPlan.created_at,
            "updated_at": AuditorWorkPlan.updated_at,
        }

        return allowed_sort_columns.get(sort_by, AuditorWorkPlan.plan_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        report_id: int | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[AuditorWorkPlan], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            report_id=report_id,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(AuditorWorkPlan)

        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)

        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(AuditorWorkPlan).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, plan_id: int) -> AuditorWorkPlan | None:
        result = await self.db.execute(
            select(AuditorWorkPlan).where(AuditorWorkPlan.plan_id == plan_id)
        )

        return result.scalar_one_or_none()

    async def get_by_report_id(
        self,
        report_id: int,
        exclude_plan_id: int | None = None,
    ) -> AuditorWorkPlan | None:
        stmt = select(AuditorWorkPlan).where(AuditorWorkPlan.report_id == report_id)

        if exclude_plan_id is not None:
            stmt = stmt.where(AuditorWorkPlan.plan_id != exclude_plan_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_meeting_report_by_id(
        self,
        report_id: int,
    ) -> MeetingReport | None:
        result = await self.db.execute(
            select(MeetingReport).where(
                MeetingReport.report_id == report_id,
                MeetingReport.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def create(
        self,
        data: dict,
        created_by: str,
    ) -> AuditorWorkPlan:
        item = AuditorWorkPlan(
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
        item: AuditorWorkPlan,
        data: dict,
        updated_by: str,
    ) -> AuditorWorkPlan:
        for field, value in data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: AuditorWorkPlan,
        updated_by: str,
    ) -> AuditorWorkPlan:
        item.is_active = False
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: AuditorWorkPlan,
        updated_by: str,
    ) -> AuditorWorkPlan:
        item.is_active = True
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: AuditorWorkPlan) -> None:
        await self.db.delete(item)
        await self.db.commit()
