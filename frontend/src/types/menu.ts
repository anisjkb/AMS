export type Menu = {
  id: number;
  navigation_group_id: number | null;
  parent_menu_id: number | null;
  menu_key: string;
  menu_title: string;
  route_path: string | null;
  icon: string | null;
  permission_key: string | null;
  sort_order: number;
  menu_level: number;
  is_expandable: boolean;
  is_visible: boolean;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MenuListResponse = {
  items: Menu[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type MenuCreatePayload = {
  navigation_group_id?: number | null;
  parent_menu_id?: number | null;
  menu_key: string;
  menu_title: string;
  route_path?: string | null;
  icon?: string | null;
  permission_key?: string | null;
  sort_order: number;
  menu_level: number;
  is_expandable: boolean;
  is_visible: boolean;
};

export type MenuUpdatePayload = Partial<MenuCreatePayload>;

export type MenuMessageResponse = {
  message: string;
  data: Menu | null;
};

export type MenuStatusFilter = "all" | "active" | "inactive";

export type MenuVisibilityFilter = "all" | "visible" | "hidden";

export type MenuQueryParams = {
  page?: number;
  pageSize?: 10 | 20 | 30 | 40 | 50 | 100;
  search?: string;
  status?: MenuStatusFilter;
  visibility?: MenuVisibilityFilter;
  navigationGroupId?: number | null;
  parentMenuId?: number | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
