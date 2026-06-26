# E:\Audit\AMS\backend\app\schemas\user_role.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserRoleCreate(BaseModel):
    user_id: int
    role_id: int


class UserRoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    role_id: int
    is_active: bool

    user_login_id: str | None = None
    user_full_name: str | None = None
    user_email: str | None = None

    role_name: str | None = None
    role_description: str | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class UserRoleMessageResponse(BaseModel):
    message: str
    data: UserRoleResponse | None = None