from sqlalchemy import and_, cast, func, or_, select, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_master import AuditMaster
from app.models.audit_team import AuditTeam
from app.models.audit_visit_info import AuditVisitInfo
from app.schemas.audit_visit_info import AuditVisitInfoCreate


class AuditVisitInfoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        audit_id: int | None,
        team_id: int | None,
        status: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    cast(AuditVisitInfo.visit_id, String).ilike(search_term),
                    cast(AuditVisitInfo.audit_id, String).ilike(search_term),
                    cast(AuditVisitInfo.team_id, String).ilike(search_term),
                    cast(AuditVisitInfo.client_address_id, String).ilike(search_term),
                    cast(AuditVisitInfo.visit_date, String).ilike(search_term),
                    AuditVisitInfo.status.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(AuditVisitInfo.is_active == is_active)

        if audit_id is not None:
            filters.append(AuditVisitInfo.audit_id == audit_id)

        if team_id is not None:
            filters.append(AuditVisitInfo.team_id == team_id)

        if status:
            filters.append(AuditVisitInfo.status == status)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "visit_id": AuditVisitInfo.visit_id,
            "audit_id": AuditVisitInfo.audit_id,
            "team_id": AuditVisitInfo.team_id,
            "client_address_id": AuditVisitInfo.client_address_id,
            "visit_date": AuditVisitInfo.visit_date,
            "status": AuditVisitInfo.status,
            "created_at": AuditVisitInfo.created_at,
            "updated_at": AuditVisitInfo.updated_at,
        }

        return allowed_sort_columns.get(sort_by, AuditVisitInfo.visit_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_id: int | None,
        team_id: int | None,
        status: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[AuditVisitInfo], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            audit_id=audit_id,
            team_id=team_id,
            status=status,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(AuditVisitInfo)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(AuditVisitInfo).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, visit_id: int) -> AuditVisitInfo | None:
        result = await self.db.execute(
            select(AuditVisitInfo).where(AuditVisitInfo.visit_id == visit_id)
        )
        return result.scalar_one_or_none()

    async def get_active_audit_master_by_id(
        self,
        audit_id: int,
    ) -> AuditMaster | None:
        result = await self.db.execute(
            select(AuditMaster).where(
                AuditMaster.audit_id == audit_id,
                AuditMaster.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_active_team_by_id(self, team_id: int) -> AuditTeam | None:
        result = await self.db.execute(
            select(AuditTeam).where(
                AuditTeam.team_id == team_id,
                AuditTeam.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditVisitInfoCreate,
        created_by: str,
    ) -> AuditVisitInfo:
        item = AuditVisitInfo(
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
        item: AuditVisitInfo,
        update_data: dict,
        updated_by: str,
    ) -> AuditVisitInfo:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: AuditVisitInfo,
        updated_by: str,
    ) -> AuditVisitInfo:
        item.is_active = False
        item.status = "inactive"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: AuditVisitInfo,
        updated_by: str,
    ) -> AuditVisitInfo:
        item.is_active = True
        item.status = "active"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: AuditVisitInfo) -> None:
        await self.db.delete(item)
        await self.db.commit()
