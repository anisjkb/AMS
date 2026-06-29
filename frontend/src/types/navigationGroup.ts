export type NavigationGroupRecord = {
  id: number;
  group_key: string;
  group_title: string;
  group_icon: string | null;
  parent_group_id: number | null;
  sort_order: number;
  is_collapsible: boolean;
  is_visible: boolean;
  group_badge: string | null;
  group_color: string | null;
  group_permission_key: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NavigationGroupListResponse = {
  items: NavigationGroupRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type NavigationGroupCreatePayload = {
  group_key: string;
  group_title: string;
  group_icon?: string | null;
  parent_group_id?: number | null;
  sort_order: number;
  is_collapsible: boolean;
  is_visible: boolean;
  group_badge?: string | null;
  group_color?: string | null;
  group_permission_key?: string | null;
};

export type NavigationGroupUpdatePayload =
  Partial<NavigationGroupCreatePayload>;

export type NavigationGroupMessageResponse = {
  message: string;
  data: NavigationGroupRecord | null;
};

export type NavigationGroupStatusFilter = "all" | "active" | "inactive";
export type NavigationGroupVisibilityFilter = "all" | "visible" | "hidden";

export type NavigationGroupQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: NavigationGroupStatusFilter;
  visibility?: NavigationGroupVisibilityFilter;
  parentGroupId?: number | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
