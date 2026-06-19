// E:\Audit\AMS\frontend\src\types\designation.ts

export type Designation = {
  id: number;

  company_id: number;
  branch_id: number;
  department_id: number;

  company_name?: string | null;
  branch_name?: string | null;
  department_name?: string | null;

  designation_code: string;
  designation_name: string;
  designation_short_name?: string | null;

  remarks?: string | null;
  is_active: boolean;

  created_by?: string | null;
  updated_by?: string | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type DesignationCreatePayload = {
  company_id: number;
  branch_id: number;
  department_id: number;

  designation_code: string;
  designation_name: string;
  designation_short_name?: string;

  remarks?: string;
};

export type DesignationUpdatePayload = Partial<DesignationCreatePayload> & {
  is_active?: boolean;
};