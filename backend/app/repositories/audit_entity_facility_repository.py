from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_facility import (
    AuditEntityFacility,
    AuditEntityFacilityType,
)
from app.schemas.audit_entity_facility import (
    AuditEntityFacilityCreate,
    AuditEntityFacilityUpdate,
)


class AuditEntityFacilityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_facility_types(
        self,
        is_active: bool | None,
    ):
        stmt = select(AuditEntityFacilityType)

        if is_active is not None:
            stmt = stmt.where(AuditEntityFacilityType.is_active == is_active)

        stmt = stmt.order_by(AuditEntityFacilityType.id.asc())

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
        facility_type_id: int | None,
        facility_status: str | None,
        ownership_type: str | None,
        is_primary: bool | None,
        is_operational: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityFacility)

        if is_active is not None:
            stmt = stmt.where(AuditEntityFacility.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(AuditEntityFacility.audit_entity_id == audit_entity_id)

        if facility_type_id is not None:
            stmt = stmt.where(AuditEntityFacility.facility_type_id == facility_type_id)

        if facility_status:
            stmt = stmt.where(AuditEntityFacility.facility_status == facility_status)

        if ownership_type:
            stmt = stmt.where(AuditEntityFacility.ownership_type == ownership_type)

        if is_primary is not None:
            stmt = stmt.where(AuditEntityFacility.is_primary == is_primary)

        if is_operational is not None:
            stmt = stmt.where(AuditEntityFacility.is_operational == is_operational)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityFacility.facility_code.ilike(search_term),
                    AuditEntityFacility.facility_name.ilike(search_term),
                    AuditEntityFacility.facility_status.ilike(search_term),
                    AuditEntityFacility.ownership_type.ilike(search_term),
                    AuditEntityFacility.registration_no.ilike(search_term),
                    AuditEntityFacility.contact_person.ilike(search_term),
                    AuditEntityFacility.contact_email.ilike(search_term),
                    AuditEntityFacility.contact_phone.ilike(search_term),
                    AuditEntityFacility.address_line1.ilike(search_term),
                    AuditEntityFacility.address_line2.ilike(search_term),
                    AuditEntityFacility.city.ilike(search_term),
                    AuditEntityFacility.country.ilike(search_term),
                    AuditEntityFacility.production_capacity.ilike(search_term),
                    AuditEntityFacility.description.ilike(search_term),
                    AuditEntityFacility.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityFacility.id,
            "facility_code": AuditEntityFacility.facility_code,
            "facility_name": AuditEntityFacility.facility_name,
            "facility_status": AuditEntityFacility.facility_status,
            "ownership_type": AuditEntityFacility.ownership_type,
            "city": AuditEntityFacility.city,
            "opening_date": AuditEntityFacility.opening_date,
            "closing_date": AuditEntityFacility.closing_date,
            "created_at": AuditEntityFacility.created_at,
            "updated_at": AuditEntityFacility.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditEntityFacility.id)

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
        facility_id: int,
    ) -> AuditEntityFacility | None:
        result = await self.db.execute(
            select(AuditEntityFacility).where(AuditEntityFacility.id == facility_id)
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

    async def get_facility_type_by_id(
        self,
        facility_type_id: int,
    ) -> AuditEntityFacilityType | None:
        result = await self.db.execute(
            select(AuditEntityFacilityType).where(
                AuditEntityFacilityType.id == facility_type_id
            )
        )
        return result.scalar_one_or_none()

    async def get_duplicate_facility(
        self,
        audit_entity_id: int,
        facility_type_id: int,
        facility_name: str,
        exclude_id: int | None = None,
    ) -> AuditEntityFacility | None:
        stmt = select(AuditEntityFacility).where(
            AuditEntityFacility.audit_entity_id == audit_entity_id,
            AuditEntityFacility.facility_type_id == facility_type_id,
            AuditEntityFacility.facility_name == facility_name,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityFacility.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityFacilityCreate,
        created_by: str,
    ) -> AuditEntityFacility:
        facility = AuditEntityFacility(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(facility)
        await self.db.commit()
        await self.db.refresh(facility)

        return facility

    async def update(
        self,
        facility: AuditEntityFacility,
        payload: AuditEntityFacilityUpdate,
        updated_by: str,
    ) -> AuditEntityFacility:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(facility, field, value)

        facility.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(facility)

        return facility

    async def set_active_status(
        self,
        facility: AuditEntityFacility,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityFacility:
        facility.is_active = is_active
        facility.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(facility)

        return facility

    async def permanent_delete(
        self,
        facility: AuditEntityFacility,
    ) -> None:
        await self.db.delete(facility)
        await self.db.commit()

    async def set_other_facilities_non_primary(
        self,
        audit_entity_id: int,
        exclude_id: int,
        updated_by: str,
    ) -> None:
        result = await self.db.execute(
            select(AuditEntityFacility).where(
                AuditEntityFacility.audit_entity_id == audit_entity_id,
                AuditEntityFacility.id != exclude_id,
                AuditEntityFacility.is_primary.is_(True),
            )
        )

        facilities = list(result.scalars().all())

        for facility in facilities:
            facility.is_primary = False
            facility.updated_by = updated_by

        await self.db.commit()
