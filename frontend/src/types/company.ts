export type Company = {
  id: number;
  company_code: string;
  company_name: string;
  company_short_name?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  company_address?: string | null;
  website?: string | null;
  tax_number?: string | null;
  trade_license?: string | null;
  remarks?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CompanyCreatePayload = {
  company_code: string;
  company_name: string;
  company_short_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  website?: string;
  tax_number?: string;
  trade_license?: string;
  remarks?: string;
};

export type CompanyUpdatePayload = Partial<CompanyCreatePayload> & {
  is_active?: boolean;
};