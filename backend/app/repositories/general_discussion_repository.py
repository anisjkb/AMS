from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.general_discussion import GeneralDiscussion


class GeneralDiscussionRepository:
    async def create(self, db: AsyncSession, obj: GeneralDiscussion):
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def get_by_id(self, db: AsyncSession, id: int):
        result = await db.execute(
            select(GeneralDiscussion).where(GeneralDiscussion.id == id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        search: str | None = None,
        status: str | None = None,
        is_active: bool | None = None,
    ):
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)
        offset = (page - 1) * page_size

        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    GeneralDiscussion.audit_type.ilike(search_term),
                    GeneralDiscussion.title.ilike(search_term),
                    GeneralDiscussion.description.ilike(search_term),
                    GeneralDiscussion.decision.ilike(search_term),
                    GeneralDiscussion.status.ilike(search_term),
                    cast(GeneralDiscussion.audit_id, String).ilike(search_term),
                )
            )

        if status and status != "all":
            filters.append(GeneralDiscussion.status == status)

        if isinstance(is_active, bool):
            filters.append(GeneralDiscussion.is_active == is_active)

        count_stmt = select(func.count()).select_from(GeneralDiscussion)
        data_stmt = select(GeneralDiscussion)

        for item_filter in filters:
            count_stmt = count_stmt.where(item_filter)
            data_stmt = data_stmt.where(item_filter)

        total_result = await db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await db.execute(
            data_stmt.order_by(GeneralDiscussion.id.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = result.scalars().all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def update(self, db: AsyncSession, obj: GeneralDiscussion):
        await db.commit()
        await db.refresh(obj)
        return obj

    async def deactivate(self, db: AsyncSession, obj: GeneralDiscussion):
        obj.is_active = False
        obj.status = "inactive"
        await db.commit()
        await db.refresh(obj)
        return obj

    async def restore(self, db: AsyncSession, obj: GeneralDiscussion):
        obj.is_active = True
        obj.status = "active"
        await db.commit()
        await db.refresh(obj)
        return obj

    async def permanent_delete(self, db: AsyncSession, obj: GeneralDiscussion):
        await db.delete(obj)
        await db.commit()
        return {"message": "General Discussion Issue record permanently deleted successfully."}
