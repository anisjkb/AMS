# E:\Audit\AMS\backend\app\schemas\menu_action_permission.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MenuActionPermissionCreate(BaseModel):
    menu_action_id: int
    permission_id: int


class MenuActionPermissionActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_id: int
    menu_key: str | None = None
    menu_title: str | None = None

    action_key: str
    action_title: str
    permission_key: str
    button_color: str | None = None
    button_icon: str | None = None
    sort_order: int
    is_active: bool
    is_visible: bool


class MenuActionPermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_action_id: int
    permission_id: int
    is_active: bool

    menu_id: int | None = None
    menu_key: str | None = None
    menu_title: str | None = None

    action_key: str | None = None
    action_title: str | None = None
    action_permission_key: str | None = None

    permission_key: str | None = None
    resource_type: str | None = None
    resource_key: str | None = None
    action: str | None = None
    description: str | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuActionPermissionMessageResponse(BaseModel):
    message: str
    data: MenuActionPermissionResponse | None = None