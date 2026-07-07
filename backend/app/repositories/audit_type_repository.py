from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_type import AuditType


class AuditTypeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        sort_by: str = "audit_type_id",
        sort_order: str = "desc",
        is_active: bool | None = None,
        status: str | None = None,
    ) -> tuple[int, list[AuditType]]:
        allowed_sort_fields = {
            "audit_type_id": AuditType.audit_type_id,
            "audit_type_name": AuditType.audit_type_name,
            "status": AuditType.status,
            "created_at": AuditType.created_at,
            "updated_at": AuditType.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditType.audit_type_id)
        order_column = asc(sort_column) if sort_order.lower() == "asc" else desc(sort_column)

        filters = []

        if is_active is not None:
            filters.append(AuditType.is_active == is_active)

        if status:
            filters.append(AuditType.status == status)

        if search:
            search_pattern = f"%{search.strip()}%"
            filters.append(
                or_(
                    AuditType.audit_type_name.ilike(search_pattern),
                    AuditType.description.ilike(search_pattern),
                    AuditType.status.ilike(search_pattern),
                )
            )

        count_query = select(func.count()).select_from(AuditType)
        query = select(AuditType)

        if filters:
            count_query = count_query.where(*filters)
            query = query.where(*filters)

        total_result = await self.db.execute(count_query)
        total = int(total_result.scalar_one())

        result = await self.db.execute(
            query.order_by(order_column)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return total, list(result.scalars().all())

    async def get_by_id(self, audit_type_id: int) -> AuditType | None:
        result = await self.db.execute(
            select(AuditType).where(AuditType.audit_type_id == audit_type_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, audit_type_name: str) -> AuditType | None:
        result = await self.db.execute(
            select(AuditType).where(
                func.lower(AuditType.audit_type_name) == audit_type_name.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(self, item: AuditType) -> AuditType:
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update(self, item: AuditType) -> AuditType:
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete(self, item: AuditType) -> None:
        await self.db.delete(item)
        await self.db.commit()
