// E:\Audit\AMS\frontend\src\types\department.ts

export type Department = {
  id: number;

  company_id: number;
  branch_id: number;

  department_name: string;
  department_code: string | null;

  /**
   * These fields are used by existing frontend DepartmentForm.
   * Backend may not return all of them yet, so keep them nullable/optional-safe.
   */
  department_short_name?: string | null;
  department_email?: string | null;
  department_phone?: string | null;
  department_address?: string | null;

  department_head_employee_id?: number | null;
  department_head_id?: number | null;
  hod_employee_id?: number | null;

  remarks: string | null;
  is_active: boolean;

  company_name: string | null;
  branch_name: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_by_name: string | null;
  updated_by_name: string | null;

  created_at: string;
  updated_at: string;
};

export type DepartmentCreatePayload = {
  company_id: number;
  branch_id: number;

  department_name: string;
  department_code?: string | null;

  department_short_name?: string | null;
  department_email?: string | null;
  department_phone?: string | null;
  department_address?: string | null;

  department_head_employee_id?: number | null;
  department_head_id?: number | null;
  hod_employee_id?: number | null;

  remarks?: string | null;
};

export type DepartmentUpdatePayload = Partial<DepartmentCreatePayload>;

export type DepartmentPayload = DepartmentCreatePayload;

export type DepartmentListResponse = {
  items: Department[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type DepartmentMessageResponse = {
  message: string;
  data: Department | null;
};