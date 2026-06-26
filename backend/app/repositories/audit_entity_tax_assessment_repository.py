from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_tax_assessment import AuditEntityTaxAssessment
from app.schemas.audit_entity_tax_assessment import (
    AuditEntityTaxAssessmentCreate,
    AuditEntityTaxAssessmentUpdate,
)


class AuditEntityTaxAssessmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        tax_year: str | None,
        tax_type: str | None,
        assessment_status: str | None,
        appeal_status: str | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityTaxAssessment)

        if is_active is not None:
            stmt = stmt.where(AuditEntityTaxAssessment.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(AuditEntityTaxAssessment.audit_entity_id == audit_entity_id)

        if tax_year:
            stmt = stmt.where(AuditEntityTaxAssessment.tax_year == tax_year)

        if tax_type:
            stmt = stmt.where(AuditEntityTaxAssessment.tax_type == tax_type)

        if assessment_status:
            stmt = stmt.where(AuditEntityTaxAssessment.assessment_status == assessment_status)

        if appeal_status:
            stmt = stmt.where(AuditEntityTaxAssessment.appeal_status == appeal_status)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityTaxAssessment.tax_year.ilike(search_term),
                    AuditEntityTaxAssessment.assessment_year.ilike(search_term),
                    AuditEntityTaxAssessment.tax_type.ilike(search_term),
                    AuditEntityTaxAssessment.tax_identification_no.ilike(search_term),
                    AuditEntityTaxAssessment.tax_zone.ilike(search_term),
                    AuditEntityTaxAssessment.tax_circle.ilike(search_term),
                    AuditEntityTaxAssessment.tax_office.ilike(search_term),
                    AuditEntityTaxAssessment.assessment_status.ilike(search_term),
                    AuditEntityTaxAssessment.appeal_status.ilike(search_term),
                    AuditEntityTaxAssessment.document_reference.ilike(search_term),
                    AuditEntityTaxAssessment.description.ilike(search_term),
                    AuditEntityTaxAssessment.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityTaxAssessment.id,
            "tax_year": AuditEntityTaxAssessment.tax_year,
            "assessment_year": AuditEntityTaxAssessment.assessment_year,
            "tax_type": AuditEntityTaxAssessment.tax_type,
            "assessment_date": AuditEntityTaxAssessment.assessment_date,
            "payment_due_date": AuditEntityTaxAssessment.payment_due_date,
            "assessment_status": AuditEntityTaxAssessment.assessment_status,
            "tax_payable": AuditEntityTaxAssessment.tax_payable,
            "outstanding_tax": AuditEntityTaxAssessment.outstanding_tax,
            "created_at": AuditEntityTaxAssessment.created_at,
            "updated_at": AuditEntityTaxAssessment.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditEntityTaxAssessment.id)

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
        assessment_id: int,
    ) -> AuditEntityTaxAssessment | None:
        result = await self.db.execute(
            select(AuditEntityTaxAssessment).where(
                AuditEntityTaxAssessment.id == assessment_id
            )
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

    async def get_duplicate_assessment(
        self,
        audit_entity_id: int,
        tax_year: str,
        tax_type: str,
        exclude_id: int | None = None,
    ) -> AuditEntityTaxAssessment | None:
        stmt = select(AuditEntityTaxAssessment).where(
            AuditEntityTaxAssessment.audit_entity_id == audit_entity_id,
            AuditEntityTaxAssessment.tax_year == tax_year,
            AuditEntityTaxAssessment.tax_type == tax_type,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityTaxAssessment.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityTaxAssessmentCreate,
        created_by: str,
    ) -> AuditEntityTaxAssessment:
        assessment = AuditEntityTaxAssessment(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(assessment)
        await self.db.commit()
        await self.db.refresh(assessment)

        return assessment

    async def update(
        self,
        assessment: AuditEntityTaxAssessment,
        payload: AuditEntityTaxAssessmentUpdate,
        updated_by: str,
    ) -> AuditEntityTaxAssessment:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(assessment, field, value)

        assessment.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(assessment)

        return assessment

    async def set_active_status(
        self,
        assessment: AuditEntityTaxAssessment,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityTaxAssessment:
        assessment.is_active = is_active
        assessment.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(assessment)

        return assessment

    async def permanent_delete(
        self,
        assessment: AuditEntityTaxAssessment,
    ) -> None:
        await self.db.delete(assessment)
        await self.db.commit()
