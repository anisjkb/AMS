// E:\Audit\AMS\frontend\src\types\role.ts

export type Role = {
  id: number;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RoleListResponse = {
  items: Role[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type RolePayload = {
  role_name: string;
  description?: string | null;
};

export type RoleMessageResponse = {
  message: string;
  data: Role | null;
};