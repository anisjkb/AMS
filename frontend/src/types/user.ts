// E:\Audit\AMS\frontend\src\types\user.ts

export type User = {
  id: number;
  user_id: string;
  email: string;
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

export type UserPayload = {
  user_id: string;
  email: string;
  full_name: string;
  password?: string;
  is_superuser: boolean;
};

export type UserUpdatePayload = {
  email?: string;
  full_name?: string;
  password?: string;
  is_superuser?: boolean;
};

export type UserMessageResponse = {
  message: string;
  data: User | null;
};