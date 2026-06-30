from sqlalchemy import and_, cast, func, or_, select, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_master import AuditMaster
from app.schemas.audit_master import AuditMasterCreate


class AuditMasterRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        client_id: int | None,
        audit_type: str | None,
        status: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    cast(AuditMaster.client_id, String).ilike(search_term),
                    AuditMaster.audit_type.ilike(search_term),
                    AuditMaster.audit_year.ilike(search_term),
                    AuditMaster.audit_note.ilike(search_term),
                    AuditMaster.status.ilike(search_term),
                    AuditMaster.audit_name.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(AuditMaster.is_active == is_active)

        if client_id is not None:
            filters.append(AuditMaster.client_id == client_id)

        if audit_type:
            filters.append(AuditMaster.audit_type == audit_type)

        if status:
            filters.append(AuditMaster.status == status)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "audit_id": AuditMaster.audit_id,
            "client_id": AuditMaster.client_id,
            "audit_type": AuditMaster.audit_type,
            "audit_year": AuditMaster.audit_year,
            "audit_start_date": AuditMaster.audit_start_date,
            "audit_end_date": AuditMaster.audit_end_date,
            "status": AuditMaster.status,
            "audit_name": AuditMaster.audit_name,
            "created_at": AuditMaster.created_at,
            "updated_at": AuditMaster.updated_at,
        }

        return allowed_sort_columns.get(sort_by, AuditMaster.audit_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        client_id: int | None,
        audit_type: str | None,
        status: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[AuditMaster], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            client_id=client_id,
            audit_type=audit_type,
            status=status,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(AuditMaster)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(AuditMaster).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, audit_id: int) -> AuditMaster | None:
        result = await self.db.execute(
            select(AuditMaster).where(AuditMaster.audit_id == audit_id)
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
        payload: AuditMasterCreate,
        created_by: str,
    ) -> AuditMaster:
        item = AuditMaster(
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
        item: AuditMaster,
        update_data: dict,
        updated_by: str,
    ) -> AuditMaster:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: AuditMaster,
        updated_by: str,
    ) -> AuditMaster:
        item.is_active = False
        item.status = "inactive"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: AuditMaster,
        updated_by: str,
    ) -> AuditMaster:
        item.is_active = True
        item.status = "active"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: AuditMaster) -> None:
        await self.db.delete(item)
        await self.db.commit()
