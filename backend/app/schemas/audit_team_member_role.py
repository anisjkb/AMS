from datetime import datetime

from pydantic import BaseModel


class AuditTeamMemberRoleResponse(BaseModel):

    role_id: int
    role_name: str
    description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



class AuditTeamMemberRoleListResponse(BaseModel):

    items: list[AuditTeamMemberRoleResponse]