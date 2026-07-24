from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_accept_repository import (
    AuditAcceptRepository,
)
from app.schemas.audit_accept import AuditAcceptBulkSaveRequest


class AuditAcceptService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditAcceptRepository(db)


    async def get_selector_options(self) -> dict:
        items = await self.repository.list_active_audit_options()

        return {
            "items": items,
        }

    async def _get_audit_context(self, audit_id: int):
        context = await self.repository.get_audit_context(
            audit_id
        )

        if context is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Active Audit Master and client record "
                    "were not found."
                ),
            )

        return context

    async def _get_applicable_template(
        self,
        audit_end_date,
    ):
        template = await self.repository.get_active_template(
            as_of_date=audit_end_date
        )

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "No active Acceptance Procedures template "
                    "is applicable to this audit."
                ),
            )

        return template

    def _build_page_response(
        self,
        audit_master,
        client,
        template,
        item_rows: list[dict],
    ) -> dict:
        items: list[dict] = []
        total_question_count = 0
        answered_count = 0

        for row in item_rows:
            item = row["item"]
            answer_value = row["answer_value"]

            if item.response_type == "yes_no":
                total_question_count += 1

                if answer_value is not None:
                    answered_count += 1

            items.append(
                {
                    "item_id": item.item_id,
                    "template_id": item.template_id,
                    "parent_item_id": item.parent_item_id,
                    "item_type": item.item_type,
                    "item_key": item.item_key,
                    "item_no": item.item_no,
                    "title": item.title,
                    "content": item.content,
                    "response_type": item.response_type,
                    "sort_order": item.sort_order,
                    "is_required": item.is_required,
                    "response_id": row["response_id"],
                    "answer_value": answer_value,
                    "response_updated_at": row[
                        "response_updated_at"
                    ],
                }
            )

        return {
            "audit": {
                "audit_id": audit_master.audit_id,
                "client_id": audit_master.client_id,
                "client_name": client.entity_name,
                "audit_name": audit_master.audit_name,
                "audit_type": audit_master.audit_type,
                "audit_year": audit_master.audit_year,
                "year_end_date": audit_master.audit_end_date,
            },
            "template": {
                "template_id": template.template_id,
                "template_key": template.template_key,
                "template_name": template.template_name,
                "reference_no": template.reference_no,
                "version": template.version,
                "intro_text": template.intro_text,
                "effective_from": template.effective_from,
                "effective_to": template.effective_to,
            },
            "items": items,
            "total_question_count": total_question_count,
            "answered_count": answered_count,
        }

    async def get_page(self, audit_id: int) -> dict:
        audit_master, client = (
            await self._get_audit_context(audit_id)
        )

        template = await self._get_applicable_template(
            audit_master.audit_end_date
        )

        item_rows = (
            await self.repository.list_items_with_responses(
                audit_id=audit_id,
                template_id=template.template_id,
            )
        )

        return self._build_page_response(
            audit_master=audit_master,
            client=client,
            template=template,
            item_rows=item_rows,
        )

    async def save_responses(
        self,
        audit_id: int,
        payload: AuditAcceptBulkSaveRequest,
        updated_by: str,
    ) -> dict:
        audit_master, _ = await self._get_audit_context(
            audit_id
        )

        selected_template = (
            await self.repository.get_active_template_by_id(
                payload.template_id
            )
        )

        if selected_template is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected Acceptance Procedures template "
                    "is invalid or inactive."
                ),
            )

        applicable_template = (
            await self._get_applicable_template(
                audit_master.audit_end_date
            )
        )

        if (
            selected_template.template_id
            != applicable_template.template_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected Acceptance Procedures template "
                    "is not applicable to this audit."
                ),
            )

        item_ids = [
            answer.item_id
            for answer in payload.answers
        ]

        active_items = (
            await self.repository.get_active_items_by_ids(
                template_id=payload.template_id,
                item_ids=item_ids,
            )
        )

        active_item_ids = {
            item.item_id
            for item in active_items
        }

        invalid_item_ids = sorted(
            set(item_ids) - active_item_ids
        )

        if invalid_item_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid, inactive, or mismatched "
                    "Acceptance Procedure item IDs: "
                    + ", ".join(
                        str(item_id)
                        for item_id in invalid_item_ids
                    )
                ),
            )

        non_answerable_item_ids = sorted(
            item.item_id
            for item in active_items
            if item.response_type != "yes_no"
        )

        if non_answerable_item_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Answers may only be saved for Yes/No "
                    "Acceptance Procedure items. Invalid IDs: "
                    + ", ".join(
                        str(item_id)
                        for item_id
                        in non_answerable_item_ids
                    )
                ),
            )

        answers = {
            answer.item_id: answer.answer_value
            for answer in payload.answers
        }

        saved_count = await self.repository.save_answers(
            audit_id=audit_id,
            template_id=payload.template_id,
            answers=answers,
            updated_by=updated_by,
        )

        refreshed_page = await self.get_page(audit_id)

        return {
            "message": (
                "Acceptance Procedures responses "
                "saved successfully."
            ),
            "saved_count": saved_count,
            "data": refreshed_page,
        }
