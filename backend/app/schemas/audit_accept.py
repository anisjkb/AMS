from datetime import date, datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


AuditAcceptAnswerValue = Literal["yes", "no"]


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