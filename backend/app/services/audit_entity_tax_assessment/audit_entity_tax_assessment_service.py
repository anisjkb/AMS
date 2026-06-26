from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_entity_tax_assessment_repository import (
    AuditEntityTaxAssessmentRepository,
)
from app.schemas.audit_entity_tax_assessment import (
    AuditEntityTaxAssessmentCreate,
    AuditEntityTaxAssessmentUpdate,
)


ALLOWED_TAX_TYPES = {
    "income_tax",
    "vat",
    "withholding_tax",
    "customs",
    "sd",
    "other",
}

ALLOWED_ASSESSMENT_STATUSES = {
    "draft",
    "submitted",
    "assessed",
    "paid",
    "partially_paid",
    "outstanding",
    "appealed",
    "closed",
}

ALLOWED_APPEAL_STATUSES = {
    "not_applicable",
    "not_appealed",
    "appealed",
    "under_review",
    "resolved",
    "withdrawn",
}


class AuditEntityTaxAssessmentService:
    def __init__(self, db: AsyncSession):
        self.assessment_repo = AuditEntityTaxAssessmentRepository(db)

    async def list_assessments(
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
        if tax_type:
            self._validate_tax_type(tax_type)

        if assessment_status:
            self._validate_assessment_status(assessment_status)

        if appeal_status:
            self._validate_appeal_status(appeal_status)

        total, items = await self.assessment_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            tax_year=tax_year,
            tax_type=tax_type,
            assessment_status=assessment_status,
            appeal_status=appeal_status,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_assessment(
        self,
        assessment_id: int,
    ):
        assessment = await self.assessment_repo.get_by_id_any_status(assessment_id)

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity tax assessment not found.",
            )

        return assessment

    async def create_assessment(
        self,
        payload: AuditEntityTaxAssessmentCreate,
        created_by: str,
    ):
        self._validate_tax_type(payload.tax_type)
        self._validate_assessment_status(payload.assessment_status)

        if payload.appeal_status:
            self._validate_appeal_status(payload.appeal_status)

        await self._validate_audit_entity(payload.audit_entity_id)

        await self._validate_duplicate_assessment(
            audit_entity_id=payload.audit_entity_id,
            tax_year=payload.tax_year,
            tax_type=payload.tax_type,
            exclude_id=None,
        )

        assessment = await self.assessment_repo.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Audit entity tax assessment created successfully.",
            "data": assessment,
        }

    async def update_assessment(
        self,
        assessment_id: int,
        payload: AuditEntityTaxAssessmentUpdate,
        updated_by: str,
    ):
        assessment = await self.assessment_repo.get_by_id_any_status(assessment_id)

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity tax assessment not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else assessment.audit_entity_id
        )
        next_tax_year = (
            payload.tax_year
            if "tax_year" in fields_set and payload.tax_year is not None
            else assessment.tax_year
        )
        next_tax_type = (
            payload.tax_type
            if "tax_type" in fields_set and payload.tax_type is not None
            else assessment.tax_type
        )
        next_assessment_status = (
            payload.assessment_status
            if "assessment_status" in fields_set and payload.assessment_status is not None
            else assessment.assessment_status
        )
        next_appeal_status = (
            payload.appeal_status
            if "appeal_status" in fields_set
            else assessment.appeal_status
        )

        self._validate_tax_type(next_tax_type)
        self._validate_assessment_status(next_assessment_status)

        if next_appeal_status:
            self._validate_appeal_status(next_appeal_status)

        await self._validate_audit_entity(next_entity_id)

        await self._validate_duplicate_assessment(
            audit_entity_id=next_entity_id,
            tax_year=next_tax_year,
            tax_type=next_tax_type,
            exclude_id=assessment.id,
        )

        assessment = await self.assessment_repo.update(
            assessment=assessment,
            payload=payload,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity tax assessment updated successfully.",
            "data": assessment,
        }

    async def deactivate_assessment(
        self,
        assessment_id: int,
        updated_by: str,
    ):
        assessment = await self.assessment_repo.get_by_id_any_status(assessment_id)

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity tax assessment not found.",
            )

        if not assessment.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity tax assessment is already inactive.",
            )

        assessment = await self.assessment_repo.set_active_status(
            assessment=assessment,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity tax assessment deactivated successfully.",
            "data": assessment,
        }

    async def restore_assessment(
        self,
        assessment_id: int,
        updated_by: str,
    ):
        assessment = await self.assessment_repo.get_by_id_any_status(assessment_id)

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity tax assessment not found.",
            )

        if assessment.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity tax assessment is already active.",
            )

        assessment = await self.assessment_repo.set_active_status(
            assessment=assessment,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity tax assessment restored successfully.",
            "data": assessment,
        }

    async def permanent_delete_assessment(
        self,
        assessment_id: int,
    ):
        assessment = await self.assessment_repo.get_by_id_any_status(assessment_id)

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity tax assessment not found.",
            )

        await self.assessment_repo.permanent_delete(assessment)

        return {
            "message": "Audit entity tax assessment permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.assessment_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_duplicate_assessment(
        self,
        audit_entity_id: int,
        tax_year: str,
        tax_type: str,
        exclude_id: int | None,
    ) -> None:
        existing = await self.assessment_repo.get_duplicate_assessment(
            audit_entity_id=audit_entity_id,
            tax_year=tax_year,
            tax_type=tax_type,
            exclude_id=exclude_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has this tax assessment for this tax year and tax type.",
            )

    def _validate_tax_type(
        self,
        tax_type: str,
    ) -> None:
        if tax_type not in ALLOWED_TAX_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid tax type. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_TAX_TYPES))
                ),
            )

    def _validate_assessment_status(
        self,
        assessment_status: str,
    ) -> None:
        if assessment_status not in ALLOWED_ASSESSMENT_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid assessment status. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_ASSESSMENT_STATUSES))
                ),
            )

    def _validate_appeal_status(
        self,
        appeal_status: str,
    ) -> None:
        if appeal_status not in ALLOWED_APPEAL_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid appeal status. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_APPEAL_STATUSES))
                ),
            )
