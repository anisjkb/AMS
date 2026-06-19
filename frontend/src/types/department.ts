// E:\Audit\AMS\frontend\src\types\department.ts

export type Department = {
  id: number;

  company_id: number;
  branch_id: number;

  company_name?: string | null;
  branch_name?: string | null;

  department_code: string;
  department_name: string;
  department_short_name?: string | null;
  department_email?: string | null;
  department_phone?: string | null;
  department_address?: string | null;

  remarks?: string | null;
  is_active: boolean;

  created_by?: string | null;
  updated_by?: string | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type DepartmentCreatePayload = {
  company_id: number;
  branch_id: number;

  department_code: string;
  department_name: string;
  department_short_name?: string;
  department_email?: string;
  department_phone?: string;
  department_address?: string;

  remarks?: string;
};

export type DepartmentUpdatePayload = Partial<DepartmentCreatePayload> & {
  is_active?: boolean;
};