from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditorWorkPlanCreate(BaseModel):
    report_id: int = Field(..., gt=0)
    work_plan_details: str = Field(..., min_length=1)

    @field_validator("work_plan_details")
    @classmethod
    def clean_work_plan_details(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Work Plan Details is required.")

        return value


class AuditorWorkPlanUpdate(BaseModel):
    report_id: int | None = Field(default=None, gt=0)
    work_plan_details: str | None = Field(default=None, min_length=1)
    is_active: bool | None = None

    @field_validator("work_plan_details")
    @classmethod
    def clean_work_plan_details(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Work Plan Details is required.")

        return value


class AuditorWorkPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    plan_id: int
    report_id: int
    work_plan_details: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class AuditorWorkPlanListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditorWorkPlanResponse]


class AuditorWorkPlanMessageResponse(BaseModel):
    message: str
    data: AuditorWorkPlanResponse | None = None
