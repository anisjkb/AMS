from datetime import date, datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


AuditAcceptAnswerValue = Literal["yes", "no"]

AuditAcceptWorkflowStatus = Literal[
    "draft",
    "submitted",
    "pending_partner_signoff",
    "pending_consultation",
    "changes_requested",
    "completed",
    "reopened",
]

AuditAcceptDecision = Literal[
    "accept",
    "accept_with_safeguards",
    "do_not_accept",
    "discontinue",
]

AuditAcceptSignoffRole = Literal[
    "engagement_partner",
    "second_partner",
    "quality_reviewer",
]


class AuditAcceptAuditContextResponse(BaseModel):
    audit_id: int
    client_id: int
    client_name: str
    audit_name: str | None = None
    audit_type: str
    audit_year: str
    year_end_date: date


class AuditAcceptTemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    template_id: int
    template_key: str
    template_name: str
    reference_no: str | None = None
    version: str
    intro_text: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None


class AuditAcceptItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_id: int
    template_id: int
    parent_item_id: int | None = None
    item_type: str
    item_key: str
    item_no: str | None = None
    title: str | None = None
    content: str | None = None
    response_type: str
    sort_order: int
    is_required: bool

    response_id: int | None = None
    answer_value: AuditAcceptAnswerValue | None = None
    response_updated_at: datetime | None = None


class AuditAcceptPageResponse(BaseModel):
    audit: AuditAcceptAuditContextResponse
    template: AuditAcceptTemplateResponse
    items: list[AuditAcceptItemResponse]
    total_question_count: int = Field(..., ge=0)
    answered_count: int = Field(..., ge=0)


class AuditAcceptAnswerInput(BaseModel):
    item_id: int = Field(..., gt=0)
    answer_value: AuditAcceptAnswerValue | None = None


class AuditAcceptBulkSaveRequest(BaseModel):
    template_id: int = Field(..., gt=0)
    answers: list[AuditAcceptAnswerInput] = Field(
        ...,
        min_length=1,
    )

    @model_validator(mode="after")
    def validate_unique_item_ids(
        self,
    ) -> "AuditAcceptBulkSaveRequest":
        item_ids = [
            answer.item_id
            for answer in self.answers
        ]

        if len(item_ids) != len(set(item_ids)):
            raise ValueError(
                "Each Acceptance Procedure item may appear only once."
            )

        return self


class AuditAcceptSaveResponse(BaseModel):
    message: str
    saved_count: int = Field(..., ge=0)
    data: AuditAcceptPageResponse


class AuditAcceptSelectorItem(BaseModel):
    audit_id: int
    audit_year: str
    client_id: int
    client_name: str
    audit_name: str | None
    audit_type: str


class AuditAcceptSelectorResponse(BaseModel):
    items: list[AuditAcceptSelectorItem]


class AuditAcceptCompletionSaveRequest(BaseModel):
    template_id: int = Field(..., gt=0)

    file_no: str | None = Field(
        default=None,
        max_length=100,
    )

    safeguards_text: str | None = Field(
        default=None,
        max_length=10000,
    )

    no_safeguard_required: bool = False

    acceptance_decision: (
        AuditAcceptDecision | None
    ) = None

    conclusion_remarks: str | None = Field(
        default=None,
        max_length=10000,
    )

    confirm_relevant_information: bool = False
    confirm_independence_evaluated: bool = False
    confirm_threats_addressed: bool = False
    confirm_safeguards_applied: bool = False
    confirm_conclusion_documented: bool = False

    consultation_required: bool = False

    consultation_remarks: str | None = Field(
        default=None,
        max_length=10000,
    )

    @model_validator(mode="after")
    def validate_completion_draft(
        self,
    ) -> "AuditAcceptCompletionSaveRequest":
        text_fields = (
            "file_no",
            "safeguards_text",
            "conclusion_remarks",
            "consultation_remarks",
        )

        for field_name in text_fields:
            value = getattr(self, field_name)

            if value is None:
                continue

            normalized_value = value.strip()

            setattr(
                self,
                field_name,
                normalized_value or None,
            )

        if (
            self.no_safeguard_required
            and self.safeguards_text is not None
        ):
            raise ValueError(
                "Safeguards text cannot be provided when "
                "no safeguard is required."
            )

        if (
            not self.consultation_required
            and self.consultation_remarks is not None
        ):
            raise ValueError(
                "Consultation remarks require consultation "
                "to be marked as required."
            )

        return self


class AuditAcceptCompletionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    completion_id: int
    audit_id: int
    template_id: int
    template_key: str
    template_version: str

    reference_no: str | None = None
    file_no: str | None = None

    workflow_status: AuditAcceptWorkflowStatus
    workflow_version: int = Field(..., ge=1)

    safeguards_text: str | None = None
    no_safeguard_required: bool

    acceptance_decision: (
        AuditAcceptDecision | None
    ) = None

    conclusion_remarks: str | None = None

    confirm_relevant_information: bool
    confirm_independence_evaluated: bool
    confirm_threats_addressed: bool
    confirm_safeguards_applied: bool
    confirm_conclusion_documented: bool

    consultation_required: bool
    consultation_remarks: str | None = None

    submitted_by_user_id: str | None = None
    submitted_at: datetime | None = None
    completed_at: datetime | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditAcceptCompletionSaveResponse(BaseModel):
    message: str
    data: AuditAcceptCompletionResponse


class AuditAcceptSignoffResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    signoff_id: int
    completion_id: int

    signoff_role: AuditAcceptSignoffRole
    workflow_version: int = Field(..., ge=1)

    signed_by_employee_id: int = Field(..., gt=0)
    signed_by_user_id: str
    signed_by_name: str
    signed_by_designation: str | None = None

    declaration_text: str | None = None
    remarks: str | None = None

    signed_at: datetime
    is_current: bool

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditAcceptCompletionStateData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    completion_id: int | None = None
    audit_id: int
    template_id: int
    template_key: str
    template_version: str

    reference_no: str | None = None
    file_no: str | None = None

    workflow_status: AuditAcceptWorkflowStatus = "draft"
    workflow_version: int = Field(default=1, ge=1)

    safeguards_text: str | None = None
    no_safeguard_required: bool = False

    acceptance_decision: (
        AuditAcceptDecision | None
    ) = None

    conclusion_remarks: str | None = None

    confirm_relevant_information: bool = False
    confirm_independence_evaluated: bool = False
    confirm_threats_addressed: bool = False
    confirm_safeguards_applied: bool = False
    confirm_conclusion_documented: bool = False

    consultation_required: bool = False
    consultation_remarks: str | None = None

    submitted_by_user_id: str | None = None
    submitted_at: datetime | None = None
    completed_at: datetime | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class AuditAcceptCompletionStateResponse(BaseModel):
    audit: dict[str, object]
    template: dict[str, object]
    exists: bool
    completion: AuditAcceptCompletionStateData

    signoffs: list[
        AuditAcceptSignoffResponse
    ] = Field(default_factory=list)


class AuditAcceptSignerOption(BaseModel):
    employee_id: int = Field(..., gt=0)
    employee_code: str
    official_employee_id: str | None = None
    employee_name: str

    designation_id: int = Field(..., gt=0)
    designation_name: str

    signature_url: str | None = None


class AuditAcceptSignerOptionsResponse(BaseModel):
    items: list[
        AuditAcceptSignerOption
    ] = Field(default_factory=list)
class AuditAcceptCompletionSubmitRequest(BaseModel):
    expected_workflow_version: int = Field(
        ...,
        ge=1,
    )


class AuditAcceptCompletionSubmitResponse(BaseModel):
    message: str
    data: AuditAcceptCompletionResponse
class AuditAcceptEngagementPartnerSignoffRequest(BaseModel):
    employee_id: int = Field(..., gt=0)

    expected_workflow_version: int = Field(
        ...,
        ge=1,
    )

    declaration_text: str | None = Field(
        default=None,
        max_length=10000,
    )

    remarks: str | None = Field(
        default=None,
        max_length=10000,
    )

    @model_validator(mode="after")
    def normalize_signoff_text(
        self,
    ) -> "AuditAcceptEngagementPartnerSignoffRequest":
        for field_name in (
            "declaration_text",
            "remarks",
        ):
            value = getattr(self, field_name)

            if value is None:
                continue

            normalized_value = value.strip()

            setattr(
                self,
                field_name,
                normalized_value or None,
            )

        return self


class AuditAcceptEngagementPartnerSignoffData(
    BaseModel
):
    completion: AuditAcceptCompletionResponse
    signoff: AuditAcceptSignoffResponse


class AuditAcceptEngagementPartnerSignoffResponse(
    BaseModel
):
    message: str
    data: AuditAcceptEngagementPartnerSignoffData

# ================================
# Audit Accept Consultation
# ================================


AuditAcceptConsultationStatus = Literal[
    "pending",
    "in_review",
    "approved",
    "returned",
]


AuditAcceptConsultationDecision = Literal[
    "approve",
    "return",
]


class AuditAcceptConsultationCreate(BaseModel):

    completion_id: int
    audit_id: int
    consultant_employee_id: int


class AuditAcceptConsultationUpdate(BaseModel):

    decision: AuditAcceptConsultationDecision | None = None
    remarks: str | None = None


class AuditAcceptConsultationResponse(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )

    consultation_id: int
    completion_id: int
    audit_id: int

    consultant_employee_id: int

    assigned_by_user_id: str | None = None

    status: AuditAcceptConsultationStatus

    decision: AuditAcceptConsultationDecision | None = None

    remarks: str | None = None

    reviewed_at: datetime | None = None

    created_at: datetime
    updated_at: datetime

# Audit Accept Consultant Employee

class AuditConsultantEmployeeResponse(BaseModel):
    id: int
    employee_name: str
    designation_name: str | None = None

