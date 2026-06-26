// E:\Audit\AMS\frontend\src\types\menuPermission.ts

export type MenuLookup = {
  id: number;
  menu_key: string;
  menu_title: string;
  route_path: string | null;
  icon: string | null;
  permission_key: string | null;
  sort_order: number;
  is_active: boolean;
};

export type MenuPermission = {
  id: number;
  menu_id: number;
  permission_id: number;
  is_active: boolean;

  menu_key?: string | null;
  menu_title?: string | null;
  route_path?: string | null;

  permission_key?: string | null;
  resource_type?: string | null;
  resource_key?: string | null;
  action?: string | null;
  description?: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MenuPermissionPayload = {
  menu_id: number;
  permission_id: number;
};

export type MenuPermissionMessageResponse = {
  message: string;
  data: MenuPermission | null;
};