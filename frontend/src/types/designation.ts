// E:\Audit\AMS\frontend\src\types\designation.ts

export type Designation = {
  id: number;

  company_id: number;
  branch_id: number;
  department_id: number;

  designation_name: string;
  designation_code: string | null;

  /**
   * Used by existing frontend DesignationForm.
   * Backend may not return this yet, so keep it nullable/optional-safe.
   */
  designation_short_name?: string | null;

  remarks: string | null;
  is_active: boolean;

  company_name?: string | null;
  branch_name?: string | null;
  department_name?: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_by_name: string | null;
  updated_by_name: string | null;

  created_at: string;
  updated_at: string;
};

export type DesignationCreatePayload = {
  company_id: number;
  branch_id: number;
  department_id: number;

  designation_name: string;
  designation_code?: string | null;
  designation_short_name?: string | null;

  remarks?: string | null;
};

export type DesignationUpdatePayload = Partial<DesignationCreatePayload>;

export type DesignationPayload = DesignationCreatePayload;

export type DesignationListResponse = {
  items: Designation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type DesignationMessageResponse = {
  message: string;
  data: Designation | null;
};