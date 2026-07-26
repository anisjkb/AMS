from datetime import date, datetime
from typing import Sequence

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.designation import Designation
from app.models.audit_accept import (
    AuditAcceptCompletion,
    AuditAcceptItem,
    AuditAcceptResponse,
    AuditAcceptSignoff,
    AuditAcceptTemplate,
)
from app.models.audit_entity import AuditEntity
from app.models.audit_master import AuditMaster


class AuditAcceptRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def list_active_audit_options(self) -> list[dict]:
        result = await self.db.execute(
            select(
                AuditMaster.audit_id,
                AuditMaster.audit_year,
                AuditMaster.client_id,
                AuditEntity.entity_name.label("client_name"),
                AuditMaster.audit_name,
                AuditMaster.audit_type,
            )
            .join(
                AuditEntity,
                AuditEntity.id == AuditMaster.client_id,
            )
            .where(
                AuditMaster.is_active.is_(True),
                AuditMaster.status == "active",
                AuditEntity.is_active.is_(True),
            )
            .order_by(
                AuditMaster.audit_year.desc(),
                AuditEntity.entity_name.asc(),
                AuditMaster.audit_name.asc().nullslast(),
                AuditMaster.audit_id.asc(),
            )
        )

        return [
            dict(row)
            for row in result.mappings().all()
        ]


    async def get_audit_context(
        self,
        audit_id: int,
    ) -> tuple[AuditMaster, AuditEntity] | None:
        result = await self.db.execute(
            select(
                AuditMaster,
                AuditEntity,
            )
            .join(
                AuditEntity,
                AuditEntity.id == AuditMaster.client_id,
            )
            .where(
                AuditMaster.audit_id == audit_id,
                AuditMaster.is_active.is_(True),
                AuditEntity.is_active.is_(True),
            )
        )

        row = result.first()

        if row is None:
            return None

        return row[0], row[1]

    async def get_active_template(
        self,
        as_of_date: date,
    ) -> AuditAcceptTemplate | None:
        result = await self.db.execute(
            select(AuditAcceptTemplate)
            .where(
                AuditAcceptTemplate.is_active.is_(True),
                or_(
                    AuditAcceptTemplate.effective_from.is_(None),
                    AuditAcceptTemplate.effective_from
                    <= as_of_date,
                ),
                or_(
                    AuditAcceptTemplate.effective_to.is_(None),
                    AuditAcceptTemplate.effective_to
                    >= as_of_date,
                ),
            )
            .order_by(
                AuditAcceptTemplate.effective_from
                .desc()
                .nullslast(),
                AuditAcceptTemplate.template_id.desc(),
            )
            .limit(1)
        )

        return result.scalar_one_or_none()

    async def get_active_template_by_id(
        self,
        template_id: int,
    ) -> AuditAcceptTemplate | None:
        result = await self.db.execute(
            select(AuditAcceptTemplate).where(
                AuditAcceptTemplate.template_id
                == template_id,
                AuditAcceptTemplate.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def list_items_with_responses(
        self,
        audit_id: int,
        template_id: int,
    ) -> list[dict]:
        response_join = and_(
            AuditAcceptResponse.audit_id == audit_id,
            AuditAcceptResponse.template_id == template_id,
            AuditAcceptResponse.item_id
            == AuditAcceptItem.item_id,
            AuditAcceptResponse.is_active.is_(True),
        )

        result = await self.db.execute(
            select(
                AuditAcceptItem,
                AuditAcceptResponse.response_id,
                AuditAcceptResponse.answer_value,
                AuditAcceptResponse.updated_at.label(
                    "response_updated_at"
                ),
            )
            .outerjoin(
                AuditAcceptResponse,
                response_join,
            )
            .where(
                AuditAcceptItem.template_id == template_id,
                AuditAcceptItem.is_active.is_(True),
            )
            .order_by(
                AuditAcceptItem.sort_order.asc(),
                AuditAcceptItem.item_id.asc(),
            )
        )

        rows: list[dict] = []

        for row in result.all():
            rows.append(
                {
                    "item": row[0],
                    "response_id": row[1],
                    "answer_value": row[2],
                    "response_updated_at": row[3],
                }
            )

        return rows

    async def get_active_items_by_ids(
        self,
        template_id: int,
        item_ids: Sequence[int],
    ) -> list[AuditAcceptItem]:
        if not item_ids:
            return []

        result = await self.db.execute(
            select(AuditAcceptItem).where(
                AuditAcceptItem.template_id == template_id,
                AuditAcceptItem.item_id.in_(item_ids),
                AuditAcceptItem.is_active.is_(True),
            )
        )

        return list(result.scalars().all())

    async def get_existing_responses(
        self,
        audit_id: int,
        template_id: int,
        item_ids: Sequence[int],
    ) -> dict[int, AuditAcceptResponse]:
        if not item_ids:
            return {}

        result = await self.db.execute(
            select(AuditAcceptResponse).where(
                AuditAcceptResponse.audit_id == audit_id,
                AuditAcceptResponse.template_id
                == template_id,
                AuditAcceptResponse.item_id.in_(item_ids),
            )
        )

        return {
            response.item_id: response
            for response in result.scalars().all()
        }

    async def save_answers(
        self,
        audit_id: int,
        template_id: int,
        answers: dict[int, str | None],
        updated_by: str,
    ) -> int:
        item_ids = list(answers)

        existing_responses = (
            await self.get_existing_responses(
                audit_id=audit_id,
                template_id=template_id,
                item_ids=item_ids,
            )
        )

        current_time = datetime.utcnow()

        for item_id, answer_value in answers.items():
            response = existing_responses.get(item_id)

            if response is None:
                response = AuditAcceptResponse(
                    audit_id=audit_id,
                    template_id=template_id,
                    item_id=item_id,
                    answer_value=answer_value,
                    is_active=True,
                    created_by=updated_by,
                    updated_by=updated_by,
                    created_at=current_time,
                    updated_at=current_time,
                )

                self.db.add(response)
                continue

            response.answer_value = answer_value
            response.is_active = True
            response.updated_by = updated_by
            response.updated_at = current_time

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return len(answers)


    async def get_template_by_id(
        self,
        template_id: int,
    ) -> AuditAcceptTemplate | None:
        result = await self.db.execute(
            select(AuditAcceptTemplate).where(
                AuditAcceptTemplate.template_id
                == template_id
            )
        )

        return result.scalar_one_or_none()

    async def get_completion(
        self,
        audit_id: int,
    ) -> AuditAcceptCompletion | None:
        result = await self.db.execute(
            select(AuditAcceptCompletion)
            .where(
                AuditAcceptCompletion.audit_id == audit_id,
                AuditAcceptCompletion.is_active.is_(True),
            )
            .order_by(
                AuditAcceptCompletion.completion_id.desc()
            )
        )

        return result.scalars().first()

    async def get_completion_by_id(
        self,
        completion_id: int,
    ) -> AuditAcceptCompletion | None:
        result = await self.db.execute(
            select(AuditAcceptCompletion).where(
                AuditAcceptCompletion.completion_id
                == completion_id,
                AuditAcceptCompletion.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def list_current_signoffs(
        self,
        completion_id: int,
    ) -> list[AuditAcceptSignoff]:
        result = await self.db.execute(
            select(AuditAcceptSignoff)
            .where(
                AuditAcceptSignoff.completion_id
                == completion_id,
                AuditAcceptSignoff.is_current.is_(True),
                AuditAcceptSignoff.is_active.is_(True),
            )
            .order_by(
                AuditAcceptSignoff.signed_at.asc(),
                AuditAcceptSignoff.signoff_id.asc(),
            )
        )

        return list(result.scalars().all())

    async def save_completion_draft(
        self,
        audit_id: int,
        template: AuditAcceptTemplate,
        values: dict[str, object],
        updated_by: str,
    ) -> AuditAcceptCompletion:
        allowed_fields = {
            "file_no",
            "safeguards_text",
            "no_safeguard_required",
            "acceptance_decision",
            "conclusion_remarks",
            "confirm_relevant_information",
            "confirm_independence_evaluated",
            "confirm_threats_addressed",
            "confirm_safeguards_applied",
            "confirm_conclusion_documented",
            "consultation_required",
            "consultation_remarks",
        }

        unexpected_fields = set(values) - allowed_fields

        if unexpected_fields:
            raise ValueError(
                "Unsupported Acceptance completion fields: "
                + ", ".join(sorted(unexpected_fields))
            )

        completion = await self.get_completion(audit_id)
        current_time = datetime.utcnow()

        if completion is None:
            completion = AuditAcceptCompletion(
                audit_id=audit_id,
                template_id=template.template_id,
                template_key=template.template_key,
                template_version=template.version,
                reference_no=template.reference_no,
                workflow_status="draft",
                workflow_version=1,
                is_active=True,
                created_by=updated_by,
                updated_by=updated_by,
                created_at=current_time,
                updated_at=current_time,
            )

            self.db.add(completion)
        else:
            completion.updated_by = updated_by
            completion.updated_at = current_time
            completion.is_active = True

        for field_name, field_value in values.items():
            setattr(
                completion,
                field_name,
                field_value,
            )

        try:
            await self.db.commit()
            await self.db.refresh(completion)
        except Exception:
            await self.db.rollback()
            raise

        return completion


    async def list_active_signer_options(
        self,
    ) -> list[dict]:
        result = await self.db.execute(
            select(
                Employee.id.label("employee_id"),
                Employee.employee_code,
                Employee.official_employee_id,
                Employee.employee_name,
                Employee.designation_id,
                Designation.designation_name,
                Employee.signature_url,
            )
            .join(
                Designation,
                Designation.id
                == Employee.designation_id,
            )
            .where(
                Employee.is_active.is_(True),
                Designation.is_active.is_(True),
            )
            .order_by(
                Employee.employee_name.asc(),
                Employee.id.asc(),
            )
        )

        return [
            dict(row._mapping)
            for row in result.all()
        ]
    async def get_completion_for_update(
        self,
        audit_id: int,
    ) -> AuditAcceptCompletion | None:
        result = await self.db.execute(
            select(AuditAcceptCompletion)
            .where(
                AuditAcceptCompletion.audit_id == audit_id,
                AuditAcceptCompletion.is_active.is_(True),
            )
            .order_by(
                AuditAcceptCompletion.completion_id.desc()
            )
            .with_for_update()
        )

        return result.scalars().first()

    async def submit_completion(
        self,
        completion: AuditAcceptCompletion,
        submitted_by_user_id: str,
    ) -> AuditAcceptCompletion:
        current_time = datetime.utcnow()

        is_resubmission = (
            completion.workflow_status
            in {
                "changes_requested",
                "reopened",
            }
        )

        if is_resubmission:
            current_signoffs = (
                await self.list_current_signoffs(
                    completion.completion_id
                )
            )

            for signoff in current_signoffs:
                signoff.is_current = False
                signoff.updated_by = submitted_by_user_id
                signoff.updated_at = current_time

            completion.workflow_version = (
                int(completion.workflow_version) + 1
            )

        completion.workflow_status = (
            "pending_partner_signoff"
        )
        completion.submitted_by_user_id = (
            submitted_by_user_id
        )
        completion.submitted_at = current_time
        completion.completed_at = None
        completion.updated_by = submitted_by_user_id
        completion.updated_at = current_time
        completion.is_active = True

        try:
            await self.db.commit()
            await self.db.refresh(completion)
        except Exception:
            await self.db.rollback()
            raise

        return completion
    async def sign_engagement_partner(
        self,
        completion: AuditAcceptCompletion,
        signer: dict[str, object],
        signed_by_user_id: str,
        declaration_text: str | None,
        remarks: str | None,
    ) -> tuple[
        AuditAcceptCompletion,
        AuditAcceptSignoff,
    ]:
        current_time = datetime.utcnow()

        employee_id = int(
            signer["employee_id"]
        )

        employee_name = str(
            signer["employee_name"]
        ).strip()

        designation_value = signer.get(
            "designation_name"
        )

        designation_name = (
            str(designation_value).strip()
            if designation_value is not None
            else None
        )

        if not employee_name:
            raise ValueError(
                "The selected employee has no name."
            )

        signoff = AuditAcceptSignoff(
            completion_id=completion.completion_id,
            signoff_role="engagement_partner",
            workflow_version=(
                completion.workflow_version
            ),
            signed_by_employee_id=employee_id,
            signed_by_user_id=signed_by_user_id,
            signed_by_name=employee_name,
            signed_by_designation=(
                designation_name or None
            ),
            declaration_text=declaration_text,
            remarks=remarks,
            signed_at=current_time,
            is_current=True,
            is_active=True,
            created_by=signed_by_user_id,
            updated_by=signed_by_user_id,
            created_at=current_time,
            updated_at=current_time,
        )

        self.db.add(signoff)

        if completion.consultation_required:
            completion.workflow_status = (
                "pending_consultation"
            )
            completion.completed_at = None
        else:
            completion.workflow_status = "completed"
            completion.completed_at = current_time

        completion.updated_by = signed_by_user_id
        completion.updated_at = current_time
        completion.is_active = True

        try:
            await self.db.commit()
            await self.db.refresh(completion)
            await self.db.refresh(signoff)
        except Exception:
            await self.db.rollback()
            raise

        return completion, signoff
