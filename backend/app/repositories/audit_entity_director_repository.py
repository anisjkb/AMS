from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_director import (
    AuditEntityDirector,
    AuditEntityDirectorType,
)
from app.schemas.audit_entity_director import (
    AuditEntityDirectorCreate,
    AuditEntityDirectorUpdate,
)


class AuditEntityDirectorRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_director_types(
        self,
        is_active: bool | None,
    ):
        stmt = select(AuditEntityDirectorType)

        if is_active is not None:
            stmt = stmt.where(AuditEntityDirectorType.is_active == is_active)

        stmt = stmt.order_by(AuditEntityDirectorType.id.asc())

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return len(items), items

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        director_type_id: int | None,
        is_primary: bool | None,
        is_signatory: bool | None,
        is_beneficial_owner: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityDirector)

        if is_active is not None:
            stmt = stmt.where(AuditEntityDirector.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(AuditEntityDirector.audit_entity_id == audit_entity_id)

        if director_type_id is not None:
            stmt = stmt.where(AuditEntityDirector.director_type_id == director_type_id)

        if is_primary is not None:
            stmt = stmt.where(AuditEntityDirector.is_primary == is_primary)

        if is_signatory is not None:
            stmt = stmt.where(AuditEntityDirector.is_signatory == is_signatory)

        if is_beneficial_owner is not None:
            stmt = stmt.where(
                AuditEntityDirector.is_beneficial_owner == is_beneficial_owner
            )

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityDirector.person_name.ilike(search_term),
                    AuditEntityDirector.designation.ilike(search_term),
                    AuditEntityDirector.father_name.ilike(search_term),
                    AuditEntityDirector.mother_name.ilike(search_term),
                    AuditEntityDirector.spouse_name.ilike(search_term),
                    AuditEntityDirector.nationality.ilike(search_term),
                    AuditEntityDirector.nid_no.ilike(search_term),
                    AuditEntityDirector.passport_no.ilike(search_term),
                    AuditEntityDirector.tax_identification_no.ilike(search_term),
                    AuditEntityDirector.email.ilike(search_term),
                    AuditEntityDirector.phone.ilike(search_term),
                    AuditEntityDirector.mobile.ilike(search_term),
                    AuditEntityDirector.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityDirector.id,
            "person_name": AuditEntityDirector.person_name,
            "designation": AuditEntityDirector.designation,
            "ownership_percentage": AuditEntityDirector.ownership_percentage,
            "appointment_date": AuditEntityDirector.appointment_date,
            "created_at": AuditEntityDirector.created_at,
            "updated_at": AuditEntityDirector.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditEntityDirector.id)

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
        director_id: int,
    ) -> AuditEntityDirector | None:
        result = await self.db.execute(
            select(AuditEntityDirector).where(AuditEntityDirector.id == director_id)
        )
        return result.scalar_one_or_none()

    async def get_audit_entity_by_id(
        self,
        audit_entity_id: int,
    ) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).where(AuditEntity.id == audit_entity_id)
        )
        return result.scalar_one_or_none()

    async def get_director_type_by_id(
        self,
        director_type_id: int,
    ) -> AuditEntityDirectorType | None:
        result = await self.db.execute(
            select(AuditEntityDirectorType).where(
                AuditEntityDirectorType.id == director_type_id
            )
        )
        return result.scalar_one_or_none()

    async def get_duplicate_director(
        self,
        audit_entity_id: int,
        person_name: str,
        nid_no: str | None,
        passport_no: str | None,
        mobile: str | None,
        exclude_id: int | None = None,
    ) -> AuditEntityDirector | None:
        stmt = select(AuditEntityDirector).where(
            AuditEntityDirector.audit_entity_id == audit_entity_id,
            AuditEntityDirector.person_name == person_name,
        )

        if nid_no:
            stmt = stmt.where(AuditEntityDirector.nid_no == nid_no)

        if passport_no:
            stmt = stmt.where(AuditEntityDirector.passport_no == passport_no)

        if mobile:
            stmt = stmt.where(AuditEntityDirector.mobile == mobile)

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityDirector.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityDirectorCreate,
        created_by: str,
    ) -> AuditEntityDirector:
        director = AuditEntityDirector(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(director)
        await self.db.commit()
        await self.db.refresh(director)

        return director

    async def update(
        self,
        director: AuditEntityDirector,
        payload: AuditEntityDirectorUpdate,
        updated_by: str,
    ) -> AuditEntityDirector:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(director, field, value)

        director.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(director)

        return director

    async def set_active_status(
        self,
        director: AuditEntityDirector,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityDirector:
        director.is_active = is_active
        director.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(director)

        return director

    async def permanent_delete(
        self,
        director: AuditEntityDirector,
    ) -> None:
        await self.db.delete(director)
        await self.db.commit()

    async def set_other_directors_non_primary(
        self,
        audit_entity_id: int,
        exclude_id: int,
        updated_by: str,
    ) -> None:
        result = await self.db.execute(
            select(AuditEntityDirector).where(
                AuditEntityDirector.audit_entity_id == audit_entity_id,
                AuditEntityDirector.id != exclude_id,
                AuditEntityDirector.is_primary.is_(True),
            )
        )

        directors = list(result.scalars().all())

        for director in directors:
            director.is_primary = False
            director.updated_by = updated_by

        await self.db.commit()
