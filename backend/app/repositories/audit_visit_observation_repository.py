from sqlalchemy import and_, cast, func, or_, select, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_discussion_issue import AuditDiscussionIssue
from app.models.audit_master import AuditMaster
from app.models.audit_team import AuditTeam
from app.models.audit_visit_info import AuditVisitInfo
from app.models.audit_visit_observation import AuditVisitObservation
from app.schemas.audit_visit_observation import AuditVisitObservationCreate


class AuditVisitObservationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        issue_id: int | None,
        visit_id: int | None,
        audit_id: int | None,
        team_id: int | None,
        audit_type: str | None,
        status: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    cast(
                        AuditVisitObservation.visit_observation_id,
                        String,
                    ).ilike(search_term),
                    cast(AuditVisitObservation.issue_id, String).ilike(search_term),
                    AuditVisitObservation.audit_type.ilike(search_term),
                    AuditVisitObservation.discussion_point.ilike(search_term),
                    AuditVisitObservation.observation_discussion.ilike(search_term),
                    AuditVisitObservation.observation_decision.ilike(search_term),
                    AuditVisitObservation.observation_note.ilike(search_term),
                    AuditVisitObservation.status.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(AuditVisitObservation.is_active == is_active)

        if issue_id is not None:
            filters.append(AuditVisitObservation.issue_id == issue_id)

        if visit_id is not None:
            filters.append(AuditVisitObservation.visit_id == visit_id)

        if audit_id is not None:
            filters.append(AuditVisitObservation.audit_id == audit_id)

        if team_id is not None:
            filters.append(AuditVisitObservation.team_id == team_id)

        if audit_type:
            filters.append(AuditVisitObservation.audit_type == audit_type)

        if status:
            filters.append(AuditVisitObservation.status == status)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "visit_observation_id": AuditVisitObservation.visit_observation_id,
            "issue_id": AuditVisitObservation.issue_id,
            "visit_id": AuditVisitObservation.visit_id,
            "audit_id": AuditVisitObservation.audit_id,
            "team_id": AuditVisitObservation.team_id,
            "audit_type": AuditVisitObservation.audit_type,
            "discussion_point": AuditVisitObservation.discussion_point,
            "status": AuditVisitObservation.status,
            "created_at": AuditVisitObservation.created_at,
            "updated_at": AuditVisitObservation.updated_at,
        }

        return allowed_sort_columns.get(
            sort_by,
            AuditVisitObservation.visit_observation_id,
        )

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        issue_id: int | None,
        visit_id: int | None,
        audit_id: int | None,
        team_id: int | None,
        audit_type: str | None,
        status: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[AuditVisitObservation], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            issue_id=issue_id,
            visit_id=visit_id,
            audit_id=audit_id,
            team_id=team_id,
            audit_type=audit_type,
            status=status,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(AuditVisitObservation)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(AuditVisitObservation).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(
        self,
        visit_observation_id: int,
    ) -> AuditVisitObservation | None:
        result = await self.db.execute(
            select(AuditVisitObservation).where(
                AuditVisitObservation.visit_observation_id == visit_observation_id
            )
        )
        return result.scalar_one_or_none()

    async def get_active_issue_by_id(
        self,
        issue_id: int,
    ) -> AuditDiscussionIssue | None:
        result = await self.db.execute(
            select(AuditDiscussionIssue).where(
                AuditDiscussionIssue.issue_id == issue_id,
                AuditDiscussionIssue.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_active_visit_by_id(
        self,
        visit_id: int,
    ) -> AuditVisitInfo | None:
        result = await self.db.execute(
            select(AuditVisitInfo).where(
                AuditVisitInfo.visit_id == visit_id,
                AuditVisitInfo.is_active.is_(True),
            )
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
        payload: AuditVisitObservationCreate,
        created_by: str,
    ) -> AuditVisitObservation:
        item = AuditVisitObservation(
            **payload.model_dump(),
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def create_from_data(
        self,
        data: dict,
        created_by: str,
    ) -> AuditVisitObservation:
        item = AuditVisitObservation(
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
        item: AuditVisitObservation,
        update_data: dict,
        updated_by: str,
    ) -> AuditVisitObservation:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: AuditVisitObservation,
        updated_by: str,
    ) -> AuditVisitObservation:
        item.is_active = False
        item.status = "inactive"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: AuditVisitObservation,
        updated_by: str,
    ) -> AuditVisitObservation:
        item.is_active = True
        item.status = "active"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: AuditVisitObservation) -> None:
        await self.db.delete(item)
        await self.db.commit()
