# E:\Audit\AMS\backend\app\schemas\navigation_group.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

class NavigationGroupBase(BaseModel):
    group_key: str = Field(..., min_length=2, max_length=100)
    group_title: str = Field(..., min_length=2, max_length=150)
    group_icon: str | None = Field(default=None, max_length=100)
    parent_group_id: int | None = Field(default=None, gt=0)
    sort_order: int = 0
    is_collapsible: bool = True
    is_visible: bool = True
    group_badge: str | None = Field(default=None, max_length=50)
    group_color: str | None = Field(default=None, max_length=50)
    group_permission_key: str | None = Field(default=None, max_length=150)

    @field_validator("group_key", "group_title")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field is required.")

        return value

    @field_validator(
        "group_icon",
        "group_badge",
        "group_color",
        "group_permission_key",
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class NavigationGroupCreate(NavigationGroupBase):
    pass


class NavigationGroupUpdate(BaseModel):
    group_key: str | None = Field(default=None, min_length=2, max_length=100)
    group_title: str | None = Field(default=None, min_length=2, max_length=150)
    group_icon: str | None = Field(default=None, max_length=100)
    parent_group_id: int | None = Field(default=None, gt=0)
    sort_order: int | None = None
    is_collapsible: bool | None = None
    is_visible: bool | None = None
    group_badge: str | None = Field(default=None, max_length=50)
    group_color: str | None = Field(default=None, max_length=50)
    group_permission_key: str | None = Field(default=None, max_length=150)

    @field_validator("group_key", "group_title")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator(
        "group_icon",
        "group_badge",
        "group_color",
        "group_permission_key",
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class NavigationGroupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    group_key: str
    group_title: str
    group_icon: str | None = None
    parent_group_id: int | None = None
    sort_order: int
    is_collapsible: bool
    is_visible: bool
    group_badge: str | None = None
    group_color: str | None = None
    group_permission_key: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class NavigationGroupListResponse(BaseModel):
    items: list[NavigationGroupResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class NavigationGroupMessageResponse(BaseModel):
    message: str
    data: NavigationGroupResponse | None = None