// E:\Audit\AMS\frontend\src\types\userRole.ts

export type UserRole = {
  id: number;
  user_id: number;
  role_id: number;
  is_active: boolean;

  user_login_id?: string | null;
  user_full_name?: string | null;
  user_email?: string | null;

  role_name?: string | null;
  role_description?: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRolePayload = {
  user_id: number;
  role_id: number;
};

export type UserRoleMessageResponse = {
  message: string;
  data: UserRole | null;
};