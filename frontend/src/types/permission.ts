// E:\Audit\AMS\frontend\src\types\permission.ts

export type Permission = {
  id: number;
  permission_key: string;
  resource_type: string;
  resource_key: string;
  action: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PermissionListResponse = {
  items: Permission[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type PermissionPayload = {
  permission_key: string;
  resource_type: string;
  resource_key: string;
  action: string;
  description?: string | null;
};

export type PermissionMessageResponse = {
  message: string;
  data: Permission | null;
};