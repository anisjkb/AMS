# E:\Audit\AMS\backend\app\schemas\menu_permission.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MenuPermissionCreate(BaseModel):
    menu_id: int
    permission_id: int


class MenuPermissionMenuResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_key: str
    menu_title: str
    route_path: str | None = None
    icon: str | None = None
    permission_key: str | None = None
    sort_order: int
    is_active: bool


class MenuPermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_id: int
    permission_id: int
    is_active: bool

    menu_key: str | None = None
    menu_title: str | None = None
    route_path: str | None = None

    permission_key: str | None = None
    resource_type: str | None = None
    resource_key: str | None = None
    action: str | None = None
    description: str | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuPermissionMessageResponse(BaseModel):
    message: str
    data: MenuPermissionResponse | None = None
