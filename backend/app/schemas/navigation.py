from pydantic import BaseModel


class NavigationActionResponse(BaseModel):
    id: int
    action_key: str
    action_title: str
    permission_key: str
    button_color: str | None = None
    button_icon: str | None = None
    sort_order: int


class NavigationMenuResponse(BaseModel):
    id: int
    menu_key: str
    menu_title: str
    route_path: str | None = None
    icon: str | None = None
    permission_key: str | None = None
    sort_order: int
    actions: list[NavigationActionResponse] = []


class NavigationGroupResponse(BaseModel):
    id: int
    group_key: str
    group_title: str
    group_icon: str | None = None
    group_badge: str | None = None
    group_color: str | None = None
    sort_order: int
    menus: list[NavigationMenuResponse] = []