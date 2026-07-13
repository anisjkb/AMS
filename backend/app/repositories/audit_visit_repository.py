from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_visit_info import AuditVisitInfo
from app.models.audit_visit_observation import AuditVisitObservation


class AuditVisitRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
    ):
        observation_count = func.count(
            AuditVisitObservation.visit_observation_id
        ).filter(
            AuditVisitObservation.is_active.is_(True)
        )

        filters = []

        if search:
            search_term = f"%{search.strip()}%"

            filters.append(
                AuditVisitInfo.visit_name.ilike(search_term)
            )

        if isinstance(is_active, bool):
            filters.append(
                AuditVisitInfo.is_active == is_active
            )

        count_stmt = (
            select(func.count(AuditVisitInfo.visit_id))
            .select_from(AuditVisitInfo)
        )

        if filters:
            count_stmt = count_stmt.where(and_(*filters))

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        stmt = (
            select(
                AuditVisitInfo.visit_id,
                AuditVisitInfo.visit_name,
                AuditVisitInfo.audit_id,
                AuditVisitInfo.team_id,
                AuditVisitInfo.client_address_id,
                AuditVisitInfo.visit_date,
                AuditVisitInfo.status,
                AuditVisitInfo.is_active,
                AuditVisitInfo.created_at,
                AuditVisitInfo.updated_at,
                observation_count.label("observation_count"),
            )
            .outerjoin(
                AuditVisitObservation,
                AuditVisitObservation.visit_id
                == AuditVisitInfo.visit_id,
            )
            .group_by(
                AuditVisitInfo.visit_id,
            )
            .order_by(
                AuditVisitInfo.visit_id.desc()
            )
        )

        if filters:
            stmt = stmt.where(and_(*filters))

        stmt = (
            stmt
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(stmt)

        items = [
            dict(row._mapping)
            for row in result.fetchall()
        ]

        return items, total
