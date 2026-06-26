from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.legal_status import LegalStatus
from app.schemas.audit_entity import AuditEntityCreate, AuditEntityUpdate


class AuditEntityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        entity_type: str | None,
        entity_class: str | None,
        parent_entity_id: int | None,
        risk_rating: str | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntity)

        if is_active is not None:
            stmt = stmt.where(AuditEntity.is_active == is_active)

        if entity_type:
            stmt = stmt.where(AuditEntity.entity_type == entity_type)

        if entity_class:
            stmt = stmt.where(AuditEntity.entity_class == entity_class)

        if parent_entity_id is not None:
            stmt = stmt.where(AuditEntity.parent_entity_id == parent_entity_id)

        if risk_rating:
            stmt = stmt.where(AuditEntity.risk_rating == risk_rating)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntity.entity_code.ilike(search_term),
                    AuditEntity.entity_name.ilike(search_term),
                    AuditEntity.registration_no.ilike(search_term),
                    AuditEntity.tax_identification_no.ilike(search_term),
                    AuditEntity.legal_status.ilike(search_term),
                    AuditEntity.contact_person.ilike(search_term),
                    AuditEntity.contact_email.ilike(search_term),
                    AuditEntity.contact_phone.ilike(search_term),
                    AuditEntity.city.ilike(search_term),
                    AuditEntity.country.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntity.id,
            "entity_code": AuditEntity.entity_code,
            "entity_name": AuditEntity.entity_name,
            "entity_type": AuditEntity.entity_type,
            "entity_class": AuditEntity.entity_class,
            "risk_rating": AuditEntity.risk_rating,
            "created_at": AuditEntity.created_at,
            "updated_at": AuditEntity.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditEntity.id)

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
        audit_entity_id: int,
    ) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).where(AuditEntity.id == audit_entity_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        entity_code: str,
    ) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).where(AuditEntity.entity_code == entity_code)
        )
        return result.scalar_one_or_none()

    async def get_by_name_and_type(
        self,
        entity_name: str,
        entity_type: str,
        exclude_id: int | None = None,
    ) -> AuditEntity | None:
        stmt = select(AuditEntity).where(
            AuditEntity.entity_name == entity_name,
            AuditEntity.entity_type == entity_type,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntity.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_last_entity(self) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).order_by(AuditEntity.id.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def get_legal_status_by_id(
        self,
        legal_status_id: int,
    ) -> LegalStatus | None:
        result = await self.db.execute(
            select(LegalStatus).where(LegalStatus.id == legal_status_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityCreate,
        entity_code: str,
        created_by: str,
    ) -> AuditEntity:
        data = payload.model_dump()
        data["entity_code"] = entity_code

        entity = AuditEntity(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(entity)
        await self.db.commit()
        await self.db.refresh(entity)

        return entity

    async def update(
        self,
        entity: AuditEntity,
        payload: AuditEntityUpdate,
        updated_by: str,
    ) -> AuditEntity:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(entity, field, value)

        entity.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(entity)

        return entity

    async def set_active_status(
        self,
        entity: AuditEntity,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntity:
        entity.is_active = is_active
        entity.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(entity)

        return entity

    async def permanent_delete(
        self,
        entity: AuditEntity,
    ) -> None:
        await self.db.delete(entity)
        await self.db.commit()
