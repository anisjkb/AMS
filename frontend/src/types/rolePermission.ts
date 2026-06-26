// E:\Audit\AMS\frontend\src\types\rolePermission.ts

export type RolePermission = {
  id: number;
  role_id: number;
  permission_id: number;
  is_active: boolean;

  role_name?: string | null;
  role_description?: string | null;

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

export type RolePermissionPayload = {
  role_id: number;
  permission_id: number;
};

export type RolePermissionMessageResponse = {
  message: string;
  data: RolePermission | null;
};