from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_address import (
    AuditEntityAddress,
    AuditEntityAddressType,
)
from app.schemas.audit_entity_address import (
    AuditEntityAddressCreate,
    AuditEntityAddressUpdate,
)


class AuditEntityAddressRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_address_types(
        self,
        is_active: bool | None,
    ):
        stmt = select(AuditEntityAddressType)

        if is_active is not None:
            stmt = stmt.where(AuditEntityAddressType.is_active == is_active)

        stmt = stmt.order_by(AuditEntityAddressType.id.asc())

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
        address_type_id: int | None,
        is_primary: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityAddress)

        if is_active is not None:
            stmt = stmt.where(AuditEntityAddress.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(AuditEntityAddress.audit_entity_id == audit_entity_id)

        if address_type_id is not None:
            stmt = stmt.where(AuditEntityAddress.address_type_id == address_type_id)

        if is_primary is not None:
            stmt = stmt.where(AuditEntityAddress.is_primary == is_primary)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityAddress.address_line1.ilike(search_term),
                    AuditEntityAddress.address_line2.ilike(search_term),
                    AuditEntityAddress.city.ilike(search_term),
                    AuditEntityAddress.state_region.ilike(search_term),
                    AuditEntityAddress.country.ilike(search_term),
                    AuditEntityAddress.post_code.ilike(search_term),
                    AuditEntityAddress.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityAddress.id,
            "city": AuditEntityAddress.city,
            "country": AuditEntityAddress.country,
            "created_at": AuditEntityAddress.created_at,
            "updated_at": AuditEntityAddress.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditEntityAddress.id)

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
        address_id: int,
    ) -> AuditEntityAddress | None:
        result = await self.db.execute(
            select(AuditEntityAddress).where(AuditEntityAddress.id == address_id)
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

    async def get_address_type_by_id(
        self,
        address_type_id: int,
    ) -> AuditEntityAddressType | None:
        result = await self.db.execute(
            select(AuditEntityAddressType).where(
                AuditEntityAddressType.id == address_type_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_entity_and_type(
        self,
        audit_entity_id: int,
        address_type_id: int,
        exclude_id: int | None = None,
    ) -> AuditEntityAddress | None:
        stmt = select(AuditEntityAddress).where(
            AuditEntityAddress.audit_entity_id == audit_entity_id,
            AuditEntityAddress.address_type_id == address_type_id,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityAddress.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityAddressCreate,
        created_by: str,
    ) -> AuditEntityAddress:
        address = AuditEntityAddress(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(address)
        await self.db.commit()
        await self.db.refresh(address)

        return address

    async def update(
        self,
        address: AuditEntityAddress,
        payload: AuditEntityAddressUpdate,
        updated_by: str,
    ) -> AuditEntityAddress:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(address, field, value)

        address.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(address)

        return address

    async def set_active_status(
        self,
        address: AuditEntityAddress,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityAddress:
        address.is_active = is_active
        address.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(address)

        return address

    async def permanent_delete(
        self,
        address: AuditEntityAddress,
    ) -> None:
        await self.db.delete(address)
        await self.db.commit()

    async def set_other_addresses_non_primary(
        self,
        audit_entity_id: int,
        exclude_id: int,
        updated_by: str,
    ) -> None:
        result = await self.db.execute(
            select(AuditEntityAddress).where(
                AuditEntityAddress.audit_entity_id == audit_entity_id,
                AuditEntityAddress.id != exclude_id,
                AuditEntityAddress.is_primary.is_(True),
            )
        )

        addresses = list(result.scalars().all())

        for address in addresses:
            address.is_primary = False
            address.updated_by = updated_by

        await self.db.commit()
