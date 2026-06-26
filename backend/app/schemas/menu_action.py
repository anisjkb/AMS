# E:\Audit\AMS\backend\app\schemas\menu_action.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MenuActionBase(BaseModel):
    menu_id: int = Field(..., gt=0)
    action_key: str = Field(..., min_length=2, max_length=100)
    action_title: str = Field(..., min_length=2, max_length=100)
    permission_key: str = Field(..., min_length=3, max_length=150)
    button_color: str | None = Field(default=None, max_length=50)
    button_icon: str | None = Field(default=None, max_length=100)
    sort_order: int = 0
    is_visible: bool = True

    @field_validator("action_key", "action_title", "permission_key")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("button_color", "button_icon")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuActionCreate(MenuActionBase):
    pass


class MenuActionUpdate(BaseModel):
    menu_id: int | None = Field(default=None, gt=0)
    action_key: str | None = Field(default=None, min_length=2, max_length=100)
    action_title: str | None = Field(default=None, min_length=2, max_length=100)
    permission_key: str | None = Field(default=None, min_length=3, max_length=150)
    button_color: str | None = Field(default=None, max_length=50)
    button_icon: str | None = Field(default=None, max_length=100)
    sort_order: int | None = None
    is_visible: bool | None = None

    @field_validator("action_key", "action_title", "permission_key")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("button_color", "button_icon")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_id: int
    action_key: str
    action_title: str
    permission_key: str
    button_color: str | None = None
    button_icon: str | None = None
    sort_order: int
    is_visible: bool
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuActionListResponse(BaseModel):
    items: list[MenuActionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MenuActionMessageResponse(BaseModel):
    message: str
    data: MenuActionResponse | None = None