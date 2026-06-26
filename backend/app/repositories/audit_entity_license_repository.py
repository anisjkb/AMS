from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_license import (
    AuditEntityLicense,
    AuditEntityLicenseType,
)
from app.schemas.audit_entity_license import (
    AuditEntityLicenseCreate,
    AuditEntityLicenseUpdate,
)


class AuditEntityLicenseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_license_types(
        self,
        is_active: bool | None,
    ):
        stmt = select(AuditEntityLicenseType)

        if is_active is not None:
            stmt = stmt.where(AuditEntityLicenseType.is_active == is_active)

        stmt = stmt.order_by(AuditEntityLicenseType.id.asc())

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
        license_type_id: int | None,
        license_status: str | None,
        is_mandatory: bool | None,
        is_verified: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityLicense)

        if is_active is not None:
            stmt = stmt.where(AuditEntityLicense.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(AuditEntityLicense.audit_entity_id == audit_entity_id)

        if license_type_id is not None:
            stmt = stmt.where(AuditEntityLicense.license_type_id == license_type_id)

        if license_status:
            stmt = stmt.where(AuditEntityLicense.license_status == license_status)

        if is_mandatory is not None:
            stmt = stmt.where(AuditEntityLicense.is_mandatory == is_mandatory)

        if is_verified is not None:
            stmt = stmt.where(AuditEntityLicense.is_verified == is_verified)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityLicense.license_no.ilike(search_term),
                    AuditEntityLicense.license_name.ilike(search_term),
                    AuditEntityLicense.issuing_authority.ilike(search_term),
                    AuditEntityLicense.issuing_country.ilike(search_term),
                    AuditEntityLicense.license_status.ilike(search_term),
                    AuditEntityLicense.document_reference.ilike(search_term),
                    AuditEntityLicense.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityLicense.id,
            "license_no": AuditEntityLicense.license_no,
            "license_name": AuditEntityLicense.license_name,
            "issuing_authority": AuditEntityLicense.issuing_authority,
            "license_status": AuditEntityLicense.license_status,
            "expiry_date": AuditEntityLicense.expiry_date,
            "renewal_due_date": AuditEntityLicense.renewal_due_date,
            "created_at": AuditEntityLicense.created_at,
            "updated_at": AuditEntityLicense.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditEntityLicense.id)

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
        license_id: int,
    ) -> AuditEntityLicense | None:
        result = await self.db.execute(
            select(AuditEntityLicense).where(AuditEntityLicense.id == license_id)
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

    async def get_license_type_by_id(
        self,
        license_type_id: int,
    ) -> AuditEntityLicenseType | None:
        result = await self.db.execute(
            select(AuditEntityLicenseType).where(
                AuditEntityLicenseType.id == license_type_id
            )
        )
        return result.scalar_one_or_none()

    async def get_duplicate_license(
        self,
        audit_entity_id: int,
        license_type_id: int,
        license_no: str,
        exclude_id: int | None = None,
    ) -> AuditEntityLicense | None:
        stmt = select(AuditEntityLicense).where(
            AuditEntityLicense.audit_entity_id == audit_entity_id,
            AuditEntityLicense.license_type_id == license_type_id,
            AuditEntityLicense.license_no == license_no,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityLicense.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityLicenseCreate,
        created_by: str,
    ) -> AuditEntityLicense:
        license_record = AuditEntityLicense(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(license_record)
        await self.db.commit()
        await self.db.refresh(license_record)

        return license_record

    async def update(
        self,
        license_record: AuditEntityLicense,
        payload: AuditEntityLicenseUpdate,
        updated_by: str,
    ) -> AuditEntityLicense:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(license_record, field, value)

        license_record.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(license_record)

        return license_record

    async def set_active_status(
        self,
        license_record: AuditEntityLicense,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityLicense:
        license_record.is_active = is_active
        license_record.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(license_record)

        return license_record

    async def permanent_delete(
        self,
        license_record: AuditEntityLicense,
    ) -> None:
        await self.db.delete(license_record)
        await self.db.commit()
