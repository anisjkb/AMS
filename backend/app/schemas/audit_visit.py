from datetime import date, datetime, datetime

from pydantic import BaseModel


class AuditVisitResponse(BaseModel):
    visit_id: int
    visit_name: str | None = None

    audit_id: int
    team_id: int
    client_address_id: int

    visit_date: date
    status: str

    observation_count: int

    is_active: bool
    created_at: datetime
    updated_at: datetime

    is_active: bool
    created_at: datetime
    updated_at: datetime


class AuditVisitListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AuditVisitResponse]
