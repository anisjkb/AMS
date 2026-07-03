from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GeneralDiscussionBase(BaseModel):
    title: str
    description: Optional[str] = None
    audit_id: int
    created_by: Optional[int] = None
    status: str = "active"
    is_active: bool = True


class GeneralDiscussionCreate(GeneralDiscussionBase):
    pass


class GeneralDiscussionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    audit_id: Optional[int] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class GeneralDiscussionResponse(GeneralDiscussionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
