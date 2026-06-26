# E:\Audit\AMS\backend\app\schemas\menu.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MenuBase(BaseModel):
    navigation_group_id: int | None = Field(default=None, gt=0)
    parent_menu_id: int | None = Field(default=None, gt=0)
    menu_key: str = Field(..., min_length=2, max_length=100)
    menu_title: str = Field(..., min_length=2, max_length=150)
    route_path: str | None = Field(default=None, max_length=255)
    icon: str | None = Field(default=None, max_length=100)
    permission_key: str | None = Field(default=None, max_length=150)
    sort_order: int = 0
    menu_level: int = Field(default=1, ge=1, le=5)
    is_expandable: bool = False
    is_visible: bool = True

    @field_validator("menu_key", "menu_title")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("route_path", "icon", "permission_key")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuCreate(MenuBase):
    pass


class MenuUpdate(BaseModel):
    navigation_group_id: int | None = Field(default=None, gt=0)
    parent_menu_id: int | None = Field(default=None, gt=0)
    menu_key: str | None = Field(default=None, min_length=2, max_length=100)
    menu_title: str | None = Field(default=None, min_length=2, max_length=150)
    route_path: str | None = Field(default=None, max_length=255)
    icon: str | None = Field(default=None, max_length=100)
    permission_key: str | None = Field(default=None, max_length=150)
    sort_order: int | None = None
    menu_level: int | None = Field(default=None, ge=1, le=5)
    is_expandable: bool | None = None
    is_visible: bool | None = None

    @field_validator("menu_key", "menu_title")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("route_path", "icon", "permission_key")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    navigation_group_id: int | None = None
    parent_menu_id: int | None = None
    menu_key: str
    menu_title: str
    route_path: str | None = None
    icon: str | None = None
    permission_key: str | None = None
    sort_order: int
    menu_level: int
    is_expandable: bool
    is_visible: bool
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuListResponse(BaseModel):
    items: list[MenuResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MenuMessageResponse(BaseModel):
    message: str
    data: MenuResponse | None = None