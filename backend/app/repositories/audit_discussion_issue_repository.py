from sqlalchemy import and_, cast, func, or_, select, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_discussion_issue import AuditDiscussionIssue
from app.schemas.audit_discussion_issue import AuditDiscussionIssueCreate


class AuditDiscussionIssueRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        audit_type: str | None,
        status: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    cast(AuditDiscussionIssue.issue_id, String).ilike(search_term),
                    AuditDiscussionIssue.audit_type.ilike(search_term),
                    AuditDiscussionIssue.discussion_point.ilike(search_term),
                    AuditDiscussionIssue.default_decision.ilike(search_term),
                    AuditDiscussionIssue.status.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(AuditDiscussionIssue.is_active == is_active)

        if audit_type:
            filters.append(AuditDiscussionIssue.audit_type == audit_type)

        if status:
            filters.append(AuditDiscussionIssue.status == status)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "issue_id": AuditDiscussionIssue.issue_id,
            "audit_type": AuditDiscussionIssue.audit_type,
            "discussion_point": AuditDiscussionIssue.discussion_point,
            "status": AuditDiscussionIssue.status,
            "created_at": AuditDiscussionIssue.created_at,
            "updated_at": AuditDiscussionIssue.updated_at,
        }

        return allowed_sort_columns.get(sort_by, AuditDiscussionIssue.issue_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_type: str | None,
        status: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[AuditDiscussionIssue], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            audit_type=audit_type,
            status=status,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(AuditDiscussionIssue)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(AuditDiscussionIssue).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, issue_id: int) -> AuditDiscussionIssue | None:
        result = await self.db.execute(
            select(AuditDiscussionIssue).where(
                AuditDiscussionIssue.issue_id == issue_id
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditDiscussionIssueCreate,
        created_by: str,
    ) -> AuditDiscussionIssue:
        item = AuditDiscussionIssue(
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
        item: AuditDiscussionIssue,
        update_data: dict,
        updated_by: str,
    ) -> AuditDiscussionIssue:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: AuditDiscussionIssue,
        updated_by: str,
    ) -> AuditDiscussionIssue:
        item.is_active = False
        item.status = "inactive"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: AuditDiscussionIssue,
        updated_by: str,
    ) -> AuditDiscussionIssue:
        item.is_active = True
        item.status = "active"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: AuditDiscussionIssue) -> None:
        await self.db.delete(item)
        await self.db.commit()
