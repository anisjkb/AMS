// E:\Audit\AMS\frontend\src\types\user.ts

export type User = {
  id: number;
  user_id: string;
  employee_id: number | null;
  email: string | null;
  full_name: string;
  is_superuser: boolean;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type UserListResponse = {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type UserEmployeeOption = {
  employee_id: number;
  employee_type: string;
  employee_code: string;
  official_employee_id: string | null;
  employee_name: string;
  email: string | null;
  can_create_user: boolean;
  blocking_reason: string | null;
};

export type UserEmployeeOptionsResponse = {
  employee_types: string[];
  items: UserEmployeeOption[];
};

export type UserPayload = {
  user_id: string;
  employee_id: number;
  password: string;
  is_superuser: boolean;
};

export type UserUpdatePayload = {
  password?: string;
  is_superuser?: boolean;
  is_active?: boolean;
};

export type UserMessageResponse = {
  message: string;
  data: User | null;
};