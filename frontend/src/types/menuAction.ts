export type MenuAction = {
  id: number;
  menu_id: number;
  action_key: string;
  action_title: string;
  permission_key: string;
  button_color: string | null;
  button_icon: string | null;
  sort_order: number;
  is_visible: boolean;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type MenuActionListResponse = {
  items: MenuAction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type MenuActionCreatePayload = {
  menu_id: number;
  action_key: string;
  action_title: string;
  permission_key: string;
  button_color?: string | null;
  button_icon?: string | null;
  sort_order: number;
  is_visible: boolean;
};

export type MenuActionUpdatePayload = Partial<MenuActionCreatePayload>;

export type MenuActionMessageResponse = {
  message: string;
  data: MenuAction | null;
};

export type MenuActionStatusFilter = "all" | "active" | "inactive";
export type MenuActionVisibilityFilter = "all" | "visible" | "hidden";

export type MenuActionQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: MenuActionStatusFilter;
  visibility?: MenuActionVisibilityFilter;
  menuId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
