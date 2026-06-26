# E:\Audit\AMS\backend\app\schemas\role_permission.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RolePermissionCreate(BaseModel):
    role_id: int
    permission_id: int


class RolePermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role_id: int
    permission_id: int
    is_active: bool

    role_name: str | None = None
    role_description: str | None = None

    permission_key: str | None = None
    resource_type: str | None = None
    resource_key: str | None = None
    action: str | None = None
    description: str | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class RolePermissionMessageResponse(BaseModel):
    message: str
    data: RolePermissionResponse | None = None
