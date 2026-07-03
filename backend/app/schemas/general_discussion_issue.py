from pydantic import BaseModel
from typing import Optional, List

class GeneralDiscussionIssueCreate(BaseModel):
    audit_id: int
    team_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    status: str = "open"


class GeneralDiscussionIssueUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    priority: Optional[str]
    status: Optional[str]


class GeneralDiscussionIssueResponse(BaseModel):
    id: int
    audit_id: int
    team_id: Optional[int]
    title: str
    description: Optional[str]
    priority: str
    status: str
    is_active: bool

    class Config:
        from_attributes = True


class GeneralDiscussionIssueList(BaseModel):
    items: List[GeneralDiscussionIssueResponse]
    total: int


class MessageResponse(BaseModel):
    message: str