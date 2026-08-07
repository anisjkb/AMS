from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_accept import (
    AuditAcceptConsultation,
)

from app.repositories.audit_accept_repository import (
    AuditAcceptRepository,
)

from app.repositories.audit_accept_consultation.audit_accept_consultation_repository import (
    audit_accept_consultation_repository,
)
from app.schemas.audit_accept import (
    AuditAcceptBulkSaveRequest,
    AuditAcceptCompletionResponse,
    AuditAcceptCompletionSaveRequest,
    AuditAcceptSignoffResponse,
    AuditAcceptEngagementPartnerSignoffRequest,
    AuditAcceptCompletionSubmitRequest,
)


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

        existing_completion = (
            await self.repository
            .get_completion_for_update(audit_id)
        )

        editable_statuses = {
            "draft",
            "changes_requested",
            "reopened",
        }

        if (
            existing_completion is not None
            and existing_completion.workflow_status
            not in editable_statuses
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Acceptance Procedure responses are locked "
                    "while the completion status is "
                    f"'{existing_completion.workflow_status}'."
                ),
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


    async def _get_completion_template(
        self,
        audit_master,
        completion,
    ):
        if completion is None:
            return await self._get_applicable_template(
                audit_master.audit_end_date
            )

        template = await self.repository.get_template_by_id(
            completion.template_id
        )

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The template pinned to this Acceptance "
                    "completion record no longer exists."
                ),
            )

        return template

    @staticmethod
    def _build_empty_completion(
        audit_id: int,
        template,
    ) -> dict:
        return {
            "completion_id": None,
            "audit_id": audit_id,
            "template_id": template.template_id,
            "template_key": template.template_key,
            "template_version": template.version,
            "reference_no": template.reference_no,
            "file_no": None,
            "workflow_status": "draft",
            "workflow_version": 1,
            "safeguards_text": None,
            "no_safeguard_required": False,
            "acceptance_decision": None,
            "conclusion_remarks": None,
            "confirm_relevant_information": False,
            "confirm_independence_evaluated": False,
            "confirm_threats_addressed": False,
            "confirm_safeguards_applied": False,
            "confirm_conclusion_documented": False,
            "consultation_required": False,
            "consultation_remarks": None,
            "submitted_by_user_id": None,
            "submitted_at": None,
            "completed_at": None,
            "created_by": None,
            "updated_by": None,
            "created_at": None,
            "updated_at": None,
        }

    async def get_completion_state(
        self,
        audit_id: int,
    ) -> dict:
        audit_master, client = (
            await self._get_audit_context(audit_id)
        )

        completion = await self.repository.get_completion(
            audit_id
        )

        template = await self._get_completion_template(
            audit_master=audit_master,
            completion=completion,
        )

        signoffs = []

        if completion is not None:
            signoff_records = (
                await self.repository.list_current_signoffs(
                    completion.completion_id
                )
            )

            signoffs = [
                AuditAcceptSignoffResponse.model_validate(
                    signoff
                ).model_dump()
                for signoff in signoff_records
            ]

            completion_data = (
                AuditAcceptCompletionResponse.model_validate(
                    completion
                ).model_dump()
            )
        else:
            completion_data = self._build_empty_completion(
                audit_id=audit_id,
                template=template,
            )

        template_key = template.template_key
        template_version = template.version
        reference_no = template.reference_no

        if completion is not None:
            template_key = completion.template_key
            template_version = completion.template_version
            reference_no = completion.reference_no

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
                "template_key": template_key,
                "template_name": template.template_name,
                "reference_no": reference_no,
                "version": template_version,
            },
            "exists": completion is not None,
            "completion": completion_data,
            "signoffs": signoffs,
        }

    async def save_completion_draft(
        self,
        audit_id: int,
        payload: AuditAcceptCompletionSaveRequest,
        updated_by: str,
    ) -> dict:
        audit_master, _ = await self._get_audit_context(
            audit_id
        )

        existing_completion = (
            await self.repository
            .get_completion_for_update(audit_id)
        )

        editable_statuses = {
            "draft",
            "changes_requested",
            "reopened",
        }

        if (
            existing_completion is not None
            and existing_completion.workflow_status
            not in editable_statuses
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This Acceptance completion is locked "
                    f"while its status is "
                    f"'{existing_completion.workflow_status}'."
                ),
            )

        if existing_completion is None:
            selected_template = (
                await self.repository
                .get_active_template_by_id(
                    payload.template_id
                )
            )

            if selected_template is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Selected Acceptance Procedures "
                        "template is invalid or inactive."
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
                        "Selected Acceptance Procedures "
                        "template is not applicable to "
                        "this audit."
                    ),
                )

            template = selected_template
        else:
            if (
                payload.template_id
                != existing_completion.template_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "The selected template does not match "
                        "the template pinned to this "
                        "Acceptance completion."
                    ),
                )

            template = await self.repository.get_template_by_id(
                existing_completion.template_id
            )

            if template is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "The template pinned to this Acceptance "
                        "completion record no longer exists."
                    ),
                )

        if (
            payload.acceptance_decision
            == "accept_with_safeguards"
            and payload.no_safeguard_required
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "An acceptance decision requiring safeguards "
                    "cannot be combined with "
                    "'no safeguard required'."
                ),
            )

        values = payload.model_dump(
            exclude={"template_id"}
        )

        completion = (
            await self.repository.save_completion_draft(
                audit_id=audit_id,
                template=template,
                values=values,
                updated_by=updated_by,
            )
        )

        return {
            "message": (
                "Acceptance completion draft "
                "saved successfully."
            ),
            "data": (
                AuditAcceptCompletionResponse.model_validate(
                    completion
                ).model_dump()
            ),
        }


    async def get_signer_options(self) -> dict:
        items = (
            await self.repository
            .list_active_signer_options()
        )

        return {
            "items": items,
        }
    @staticmethod
    def _collect_submit_validation_errors(
        completion,
        item_rows: list[dict],
    ) -> tuple[list[str], list[int]]:
        errors: list[str] = []

        required_questions = [
            row
            for row in item_rows
            if (
                row["item"].response_type == "yes_no"
                and row["item"].is_required
            )
        ]

        missing_required_item_ids = [
            row["item"].item_id
            for row in required_questions
            if row["answer_value"] is None
        ]

        if not required_questions:
            errors.append(
                "The pinned template contains no required "
                "Yes/No questions."
            )
        elif missing_required_item_ids:
            errors.append(
                f"{len(missing_required_item_ids)} required "
                "Yes/No question(s) remain unanswered."
            )

        if completion.acceptance_decision is None:
            errors.append(
                "An acceptance decision is required."
            )

        safeguards_text = (
            completion.safeguards_text or ""
        ).strip()

        consultation_remarks = (
            completion.consultation_remarks or ""
        ).strip()

        if (
            completion.no_safeguard_required
            and safeguards_text
        ):
            errors.append(
                "Safeguards text cannot be combined with "
                "'no safeguard required'."
            )

        if (
            completion.acceptance_decision
            == "accept_with_safeguards"
            and not safeguards_text
        ):
            errors.append(
                "Safeguards must be documented when the "
                "decision is 'accept with safeguards'."
            )

        if (
            completion.acceptance_decision
            == "accept_with_safeguards"
            and completion.no_safeguard_required
        ):
            errors.append(
                "The 'accept with safeguards' decision cannot "
                "be combined with 'no safeguard required'."
            )

        confirmation_fields = (
            (
                "confirm_relevant_information",
                "Relevant information confirmation",
            ),
            (
                "confirm_independence_evaluated",
                "Independence evaluation confirmation",
            ),
            (
                "confirm_threats_addressed",
                "Threats assessment confirmation",
            ),
            (
                "confirm_safeguards_applied",
                "Safeguards application confirmation",
            ),
            (
                "confirm_conclusion_documented",
                "Conclusion documentation confirmation",
            ),
        )

        missing_confirmations = [
            label
            for field_name, label
            in confirmation_fields
            if not getattr(completion, field_name)
        ]

        if missing_confirmations:
            errors.append(
                "The following confirmations are required: "
                + ", ".join(missing_confirmations)
                + "."
            )

        if (
            completion.consultation_required
            and not consultation_remarks
        ):
            errors.append(
                "Consultation remarks are required when "
                "consultation is marked as required."
            )

        if (
            not completion.consultation_required
            and consultation_remarks
        ):
            errors.append(
                "Consultation remarks cannot be provided unless "
                "consultation is marked as required."
            )

        return (
            errors,
            missing_required_item_ids,
        )

    async def submit_completion(
        self,
        audit_id: int,
        expected_workflow_version: int,
        submitted_by_user_id: str,
    ) -> dict:
        audit_master, _ = await self._get_audit_context(
            audit_id
        )

        completion = (
            await self.repository
            .get_completion_for_update(audit_id)
        )

        if completion is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Save the Acceptance completion draft "
                    "before submitting it."
                ),
            )

        if (
            completion.workflow_version
            != expected_workflow_version
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The Acceptance workflow has changed. "
                    "Reload the latest completion state "
                    "before submitting."
                ),
            )

        editable_statuses = {
            "draft",
            "changes_requested",
            "reopened",
        }

        if completion.workflow_status not in editable_statuses:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This Acceptance completion cannot be "
                    "submitted while its status is "
                    f"'{completion.workflow_status}'."
                ),
            )

        await self._get_completion_template(
            audit_master=audit_master,
            completion=completion,
        )

        item_rows = (
            await self.repository
            .list_items_with_responses(
                audit_id=audit_id,
                template_id=completion.template_id,
            )
        )

        (
            validation_errors,
            missing_required_item_ids,
        ) = self._collect_submit_validation_errors(
            completion=completion,
            item_rows=item_rows,
        )

        if validation_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": (
                        "Acceptance Procedures cannot be "
                        "submitted because required information "
                        "is incomplete."
                    ),
                    "errors": validation_errors,
                    "missing_required_item_ids": (
                        missing_required_item_ids
                    ),
                },
            )

        submitted_completion = (
            await self.repository.submit_completion(
                completion=completion,
                submitted_by_user_id=submitted_by_user_id,
            )
        )

        if submitted_completion.consultation_required:

            existing_requests = await (
                audit_accept_consultation_repository.get_by_audit(
                    self.repository.db,
                    audit_id,
                )
            )

            if not existing_requests:

                consultation = AuditAcceptConsultation(
                    audit_id=audit_id,
                    completion_id=submitted_completion.completion_id,
                    consultant_employee_id=1,
                    assigned_by_user_id=submitted_by_user_id,
                    status="pending",
                )

                await (
                    audit_accept_consultation_repository.create(
                        self.repository.db,
                        consultation,
                    )
                )

        return {
            "message": (
                "Acceptance Procedures submitted for "
                "engagement partner sign-off."
            ),
            "data": (
                AuditAcceptCompletionResponse.model_validate(
                    submitted_completion
                ).model_dump()
            ),
        }
    async def sign_engagement_partner(
        self,
        audit_id: int,
        payload: (
            AuditAcceptEngagementPartnerSignoffRequest
        ),
        signed_by_user_id: str,
    ) -> dict:
        await self._get_audit_context(audit_id)

        completion = (
            await self.repository
            .get_completion_for_update(audit_id)
        )

        if completion is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Submit the Acceptance Procedures "
                    "before engagement partner sign-off."
                ),
            )

        if (
            completion.workflow_version
            != payload.expected_workflow_version
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The Acceptance workflow has changed. "
                    "Reload the latest completion state "
                    "before signing."
                ),
            )

        if (
            completion.workflow_status
            != "pending_partner_signoff"
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Engagement partner sign-off is not "
                    "allowed while the Acceptance status is "
                    f"'{completion.workflow_status}'."
                ),
            )

        current_signoffs = (
            await self.repository.list_current_signoffs(
                completion.completion_id
            )
        )

        duplicate_signoff = next(
            (
                signoff
                for signoff in current_signoffs
                if (
                    signoff.signoff_role
                    == "engagement_partner"
                    and signoff.workflow_version
                    == completion.workflow_version
                )
            ),
            None,
        )

        if duplicate_signoff is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "An engagement partner sign-off already "
                    "exists for the current workflow version."
                ),
            )

        signer_options = (
            await self.repository
            .list_active_signer_options()
        )

        signer = next(
            (
                option
                for option in signer_options
                if (
                    int(option["employee_id"])
                    == payload.employee_id
                )
            ),
            None,
        )

        if signer is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The selected signer is not an active "
                    "Employee with an active designation."
                ),
            )

        try:
            (
                signed_completion,
                signoff,
            ) = await self.repository.sign_engagement_partner(
                completion=completion,
                signer=signer,
                signed_by_user_id=signed_by_user_id,
                declaration_text=(
                    payload.declaration_text
                ),
                remarks=payload.remarks,
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc

        if (
            signed_completion.workflow_status
            == "pending_consultation"
        ):
            message = (
                "Engagement partner sign-off recorded. "
                "The Acceptance Procedures are pending "
                "second-partner consultation."
            )
        else:
            message = (
                "Engagement partner sign-off recorded "
                "and the Acceptance Procedures completed."
            )

        return {
            "message": message,
            "data": {
                "completion": (
                    AuditAcceptCompletionResponse
                    .model_validate(
                        signed_completion
                    )
                    .model_dump()
                ),
                "signoff": (
                    AuditAcceptSignoffResponse
                    .model_validate(signoff)
                    .model_dump()
                ),
            },
        }




