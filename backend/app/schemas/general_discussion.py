from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class GeneralDiscussionBase(BaseModel):
    audit_type: str
    title: str
    description: Optional[str] = None
    decision: Optional[str] = None
    audit_id: Optional[int] = None
    created_by: Optional[int] = None
    status: str = "active"
    is_active: bool = True


class GeneralDiscussionCreate(GeneralDiscussionBase):
    pass


class GeneralDiscussionUpdate(BaseModel):
    audit_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    decision: Optional[str] = None
    audit_id: Optional[int] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None


class GeneralDiscussionResponse(GeneralDiscussionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
