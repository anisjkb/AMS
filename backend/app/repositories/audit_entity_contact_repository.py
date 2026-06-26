from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_contact import (
    AuditEntityContact,
    AuditEntityContactType,
)
from app.schemas.audit_entity_contact import (
    AuditEntityContactCreate,
    AuditEntityContactUpdate,
)


class AuditEntityContactRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_contact_types(
        self,
        is_active: bool | None,
    ):
        stmt = select(AuditEntityContactType)

        if is_active is not None:
            stmt = stmt.where(AuditEntityContactType.is_active == is_active)

        stmt = stmt.order_by(AuditEntityContactType.id.asc())

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
        contact_type_id: int | None,
        is_primary: bool | None,
        is_authorized_representative: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityContact)

        if is_active is not None:
            stmt = stmt.where(AuditEntityContact.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(AuditEntityContact.audit_entity_id == audit_entity_id)

        if contact_type_id is not None:
            stmt = stmt.where(AuditEntityContact.contact_type_id == contact_type_id)

        if is_primary is not None:
            stmt = stmt.where(AuditEntityContact.is_primary == is_primary)

        if is_authorized_representative is not None:
            stmt = stmt.where(
                AuditEntityContact.is_authorized_representative
                == is_authorized_representative
            )

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityContact.contact_name.ilike(search_term),
                    AuditEntityContact.designation.ilike(search_term),
                    AuditEntityContact.department.ilike(search_term),
                    AuditEntityContact.email.ilike(search_term),
                    AuditEntityContact.phone.ilike(search_term),
                    AuditEntityContact.mobile.ilike(search_term),
                    AuditEntityContact.whatsapp.ilike(search_term),
                    AuditEntityContact.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityContact.id,
            "contact_name": AuditEntityContact.contact_name,
            "designation": AuditEntityContact.designation,
            "email": AuditEntityContact.email,
            "mobile": AuditEntityContact.mobile,
            "created_at": AuditEntityContact.created_at,
            "updated_at": AuditEntityContact.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditEntityContact.id)

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
        contact_id: int,
    ) -> AuditEntityContact | None:
        result = await self.db.execute(
            select(AuditEntityContact).where(AuditEntityContact.id == contact_id)
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

    async def get_contact_type_by_id(
        self,
        contact_type_id: int,
    ) -> AuditEntityContactType | None:
        result = await self.db.execute(
            select(AuditEntityContactType).where(
                AuditEntityContactType.id == contact_type_id
            )
        )
        return result.scalar_one_or_none()

    async def get_duplicate_contact(
        self,
        audit_entity_id: int,
        contact_name: str,
        email: str | None,
        mobile: str | None,
        exclude_id: int | None = None,
    ) -> AuditEntityContact | None:
        stmt = select(AuditEntityContact).where(
            AuditEntityContact.audit_entity_id == audit_entity_id,
            AuditEntityContact.contact_name == contact_name,
        )

        if email:
            stmt = stmt.where(AuditEntityContact.email == email)

        if mobile:
            stmt = stmt.where(AuditEntityContact.mobile == mobile)

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityContact.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityContactCreate,
        created_by: str,
    ) -> AuditEntityContact:
        contact = AuditEntityContact(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(contact)
        await self.db.commit()
        await self.db.refresh(contact)

        return contact

    async def update(
        self,
        contact: AuditEntityContact,
        payload: AuditEntityContactUpdate,
        updated_by: str,
    ) -> AuditEntityContact:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(contact, field, value)

        contact.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(contact)

        return contact

    async def set_active_status(
        self,
        contact: AuditEntityContact,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityContact:
        contact.is_active = is_active
        contact.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(contact)

        return contact

    async def permanent_delete(
        self,
        contact: AuditEntityContact,
    ) -> None:
        await self.db.delete(contact)
        await self.db.commit()

    async def set_other_contacts_non_primary(
        self,
        audit_entity_id: int,
        exclude_id: int,
        updated_by: str,
    ) -> None:
        result = await self.db.execute(
            select(AuditEntityContact).where(
                AuditEntityContact.audit_entity_id == audit_entity_id,
                AuditEntityContact.id != exclude_id,
                AuditEntityContact.is_primary.is_(True),
            )
        )

        contacts = list(result.scalars().all())

        for contact in contacts:
            contact.is_primary = False
            contact.updated_by = updated_by

        await self.db.commit()
