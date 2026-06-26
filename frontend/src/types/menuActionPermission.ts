// E:\Audit\AMS\frontend\src\types\menuActionPermission.ts

export type MenuActionLookup = {
  id: number;
  menu_id: number;
  menu_key: string | null;
  menu_title: string | null;

  action_key: string;
  action_title: string;
  permission_key: string;
  button_color: string | null;
  button_icon: string | null;
  sort_order: number;
  is_active: boolean;
  is_visible: boolean;
};

export type MenuActionPermission = {
  id: number;
  menu_action_id: number;
  permission_id: number;
  is_active: boolean;

  menu_id?: number | null;
  menu_key?: string | null;
  menu_title?: string | null;

  action_key?: string | null;
  action_title?: string | null;
  action_permission_key?: string | null;

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

export type MenuActionPermissionPayload = {
  menu_action_id: number;
  permission_id: number;
};

export type MenuActionPermissionMessageResponse = {
  message: string;
  data: MenuActionPermission | null;
};