from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


ParticipantSourceType = Literal["internal_audit_team", "client_entity_team"]


class MeetingParticipantCreate(BaseModel):
    meeting_id: int = Field(..., gt=0)
    source_type: ParticipantSourceType
    audit_team_id: int | None = Field(default=None, gt=0)
    entity_contact_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_source(self):
        if self.source_type == "internal_audit_team" and not self.audit_team_id:
            raise ValueError("Audit Team is required for Internal Audit Team source.")

        if self.source_type == "client_entity_team" and not self.entity_contact_id:
            raise ValueError("Entity contact is required for Client/Entity Team source.")

        return self


class MeetingParticipantUpdate(BaseModel):
    meeting_id: int | None = Field(default=None, gt=0)
    source_type: ParticipantSourceType | None = None
    audit_team_id: int | None = Field(default=None, gt=0)
    audit_team_member_id: int | None = Field(default=None, gt=0)
    entity_contact_id: int | None = Field(default=None, gt=0)
    is_active: bool | None = None


class MeetingParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    participant_id: int
    meeting_id: int
    meeting_name: str | None = None
    meeting_type_id: int | None = None
    meeting_type: str | None = None
    client_id: int | None = None
    client_code: str | None = None

    source_type: str
    source_label: str | None = None

    audit_team_id: int | None = None
    audit_team_name: str | None = None
    audit_team_member_id: int | None = None
    entity_contact_id: int | None = None

    participant_name: str | None = None
    designation: str | None = None

    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MeetingParticipantListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[MeetingParticipantResponse]


class MeetingParticipantMessageResponse(BaseModel):
    message: str
    data: MeetingParticipantResponse | list[MeetingParticipantResponse] | None = None


class MeetingParticipantInternalTeamOption(BaseModel):
    team_id: int
    team_name: str
    member_count: int


class MeetingParticipantInternalTeamOptionsResponse(BaseModel):
    items: list[MeetingParticipantInternalTeamOption]


class MeetingParticipantEntityContactOption(BaseModel):
    id: int
    audit_entity_id: int
    contact_name: str
    designation: str | None = None
    department: str | None = None
    email: str | None = None
    mobile: str | None = None


class MeetingParticipantEntityContactOptionsResponse(BaseModel):
    items: list[MeetingParticipantEntityContactOption]
