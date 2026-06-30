from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_team import AuditTeam
from app.schemas.audit_team import AuditTeamCreate


class AuditTeamRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        status: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    AuditTeam.team_name.ilike(search_term),
                    AuditTeam.team_note.ilike(search_term),
                    AuditTeam.status.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(AuditTeam.is_active == is_active)

        if status:
            filters.append(AuditTeam.status == status)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "team_id": AuditTeam.team_id,
            "team_name": AuditTeam.team_name,
            "status": AuditTeam.status,
            "created_at": AuditTeam.created_at,
            "updated_at": AuditTeam.updated_at,
        }

        return allowed_sort_columns.get(sort_by, AuditTeam.team_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        status: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[AuditTeam], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            status=status,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(AuditTeam)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(AuditTeam).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, team_id: int) -> AuditTeam | None:
        result = await self.db.execute(
            select(AuditTeam).where(AuditTeam.team_id == team_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditTeamCreate,
        created_by: str,
    ) -> AuditTeam:
        item = AuditTeam(
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
        item: AuditTeam,
        update_data: dict,
        updated_by: str,
    ) -> AuditTeam:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: AuditTeam,
        updated_by: str,
    ) -> AuditTeam:
        item.is_active = False
        item.status = "inactive"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: AuditTeam,
        updated_by: str,
    ) -> AuditTeam:
        item.is_active = True
        item.status = "active"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: AuditTeam) -> None:
        await self.db.delete(item)
        await self.db.commit()
