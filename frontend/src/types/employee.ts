// E:\Audit\AMS\frontend\src\types\employee.ts

export type EmployeeType =
  | "Permanent"
  | "Contractual"
  | "Probation"
  | "Intern"
  | "Temporary"
  | "Part Time"
  | "Student"
  | "Other";

export type Gender = "Male" | "Female" | "Other";

export type Employee = {
  id: number;

  employee_code: string;
  official_employee_id?: string | null;
  employee_name: string;

  photo_url?: string | null;
  photo_thumb_url?: string | null;
  passport_photo_url?: string | null;
  photo_original_name?: string | null;
  photo_mime_type?: string | null;
  photo_size_bytes?: number | null;
  signature_url?: string | null;

  email?: string | null;
  phone?: string | null;
  nid?: string | null;

  dob?: string | null;
  joining_date?: string | null;

  gender?: string | null;
  employee_type: string;

  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;

  company_name?: string | null;
  branch_name?: string | null;
  department_name?: string | null;
  designation_name?: string | null;

  reporting_to_employee_id?: number | null;
  reporting_to_employee_name?: string | null;

  remarks?: string | null;
  is_active: boolean;

  created_by?: string | null;
  updated_by?: string | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type EmployeeCreatePayload = {
  employee_name: string;
  employee_code?: string;
  official_employee_id?: string;

  email?: string;
  phone?: string;
  nid?: string;

  dob?: string;
  joining_date?: string;

  gender?: string;
  employee_type: string;

  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;

  reporting_to_employee_id?: number | null;

  remarks?: string;
};

export type EmployeeUpdatePayload = Partial<EmployeeCreatePayload> & {
  is_active?: boolean;
};