from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.legal_status import LegalStatus
from app.schemas.legal_status import LegalStatusCreate, LegalStatusUpdate


class LegalStatusRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(LegalStatus)

        if is_active is not None:
            stmt = stmt.where(LegalStatus.is_active == is_active)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    LegalStatus.legal_status_code.ilike(search_term),
                    LegalStatus.legal_status_name.ilike(search_term),
                    LegalStatus.description.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": LegalStatus.id,
            "legal_status_code": LegalStatus.legal_status_code,
            "legal_status_name": LegalStatus.legal_status_name,
            "created_at": LegalStatus.created_at,
            "updated_at": LegalStatus.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, LegalStatus.id)

        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return total or 0, items

    async def get_by_id_any_status(
        self,
        legal_status_id: int,
    ) -> LegalStatus | None:
        result = await self.db.execute(
            select(LegalStatus).where(LegalStatus.id == legal_status_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        legal_status_code: str,
    ) -> LegalStatus | None:
        result = await self.db.execute(
            select(LegalStatus).where(
                LegalStatus.legal_status_code == legal_status_code
            )
        )
        return result.scalar_one_or_none()

    async def get_by_name(
        self,
        legal_status_name: str,
    ) -> LegalStatus | None:
        result = await self.db.execute(
            select(LegalStatus).where(
                LegalStatus.legal_status_name == legal_status_name
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: LegalStatusCreate,
        created_by: str,
    ) -> LegalStatus:
        legal_status = LegalStatus(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(legal_status)
        await self.db.commit()
        await self.db.refresh(legal_status)

        return legal_status

    async def update(
        self,
        legal_status: LegalStatus,
        payload: LegalStatusUpdate,
        updated_by: str,
    ) -> LegalStatus:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(legal_status, field, value)

        legal_status.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(legal_status)

        return legal_status

    async def set_active_status(
        self,
        legal_status: LegalStatus,
        is_active: bool,
        updated_by: str,
    ) -> LegalStatus:
        legal_status.is_active = is_active
        legal_status.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(legal_status)

        return legal_status

    async def permanent_delete(
        self,
        legal_status: LegalStatus,
    ) -> None:
        await self.db.delete(legal_status)
        await self.db.commit()
