// E:\Audit\AMS\frontend\src\types\employee.ts

export type Employee = {
  id: number;

  employee_code: string;
  official_employee_id: string | null;
  employee_name: string;

  photo_url: string | null;
  photo_thumb_url: string | null;
  signature_url: string | null;
  signature_thumb_url: string | null;

  email: string | null;
  phone: string | null;
  nid: string | null;

  dob: string | null;
  joining_date: string | null;
  gender: string | null;

  /**
   * Existing frontend form uses employee_type.
   * Backend response may use employee_status.
   * Keep both until naming is standardized.
   */
  employee_type: string | null;
  employee_status: string | null;

  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;
  reporting_to_employee_id: number | null;

  remarks: string | null;
  is_active: boolean;

  company_name: string | null;
  branch_name: string | null;
  department_name: string | null;
  designation_name: string | null;
  reporting_to_employee_name: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_by_name: string | null;
  updated_by_name: string | null;

  created_at: string;
  updated_at: string;
};

export type EmployeeCreatePayload = {
  employee_code?: string | null;
  official_employee_id?: string | null;
  employee_name: string;

  email?: string | null;
  phone?: string | null;
  nid?: string | null;

  dob?: string | null;
  joining_date?: string | null;
  gender?: string | null;

  employee_type?: string | null;
  employee_status?: string | null;

  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;
  reporting_to_employee_id?: number | null;

  remarks?: string | null;
};

export type EmployeeUpdatePayload = Partial<EmployeeCreatePayload>;

export type EmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type EmployeeMessageResponse = {
  message: string;
  data: Employee | null;
};