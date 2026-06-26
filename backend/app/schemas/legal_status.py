from datetime import datetime

from pydantic import BaseModel, Field


class LegalStatusBase(BaseModel):
    legal_status_code: str = Field(..., max_length=20)
    legal_status_name: str = Field(..., max_length=150)
    description: str | None = None


class LegalStatusCreate(LegalStatusBase):
    pass


class LegalStatusUpdate(BaseModel):
    legal_status_code: str | None = Field(default=None, max_length=20)
    legal_status_name: str | None = Field(default=None, max_length=150)
    description: str | None = None
    is_active: bool | None = None


class LegalStatusResponse(LegalStatusBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class LegalStatusListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[LegalStatusResponse]


class LegalStatusMessageResponse(BaseModel):
    message: str
    data: LegalStatusResponse | None = None
