export type Branch = {
  id: number;
  company_id: number;
  company_name?: string | null;
  branch_code: string;
  branch_name: string;
  branch_short_name?: string | null;
  branch_email?: string | null;
  branch_phone?: string | null;
  branch_address?: string | null;
  remarks?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BranchCreatePayload = {
  company_id: number;
  branch_code: string;
  branch_name: string;
  branch_short_name?: string;
  branch_email?: string;
  branch_phone?: string;
  branch_address?: string;
  remarks?: string;
};

export type BranchUpdatePayload = Partial<BranchCreatePayload> & {
  is_active?: boolean;
};