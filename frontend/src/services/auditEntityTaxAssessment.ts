export type AuditEntityTaxType =
  | "income_tax"
  | "vat"
  | "withholding_tax"
  | "customs"
  | "sd"
  | "other";

export type AuditEntityTaxAssessmentStatus =
  | "draft"
  | "submitted"
  | "assessed"
  | "paid"
  | "partially_paid"
  | "outstanding"
  | "appealed"
  | "closed";

export type AuditEntityTaxAppealStatus =
  | "not_applicable"
  | "not_appealed"
  | "appealed"
  | "under_review"
  | "resolved"
  | "withdrawn";

export type AuditEntityTaxAssessment = {
  id: number;
  audit_entity_id: number;
  tax_year: string;
  assessment_year: string | null;
  tax_type: AuditEntityTaxType;
  tax_identification_no: string | null;
  tax_zone: string | null;
  tax_circle: string | null;
  tax_office: string | null;
  return_submission_date: string | null;
  assessment_date: string | null;
  demand_notice_date: string | null;
  payment_due_date: string | null;
  declared_income: string | null;
  assessed_income: string | null;
  taxable_income: string | null;
  tax_payable: string | null;
  tax_paid: string | null;
  outstanding_tax: string | null;
  penalty_amount: string | null;
  interest_amount: string | null;
  assessment_status: AuditEntityTaxAssessmentStatus;
  appeal_status: AuditEntityTaxAppealStatus | null;
  document_reference: string | null;
  description: string | null;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityTaxAssessmentPayload = {
  audit_entity_id: number;
  tax_year: string;
  assessment_year?: string | null;
  tax_type: AuditEntityTaxType;
  tax_identification_no?: string | null;
  tax_zone?: string | null;
  tax_circle?: string | null;
  tax_office?: string | null;
  return_submission_date?: string | null;
  assessment_date?: string | null;
  demand_notice_date?: string | null;
  payment_due_date?: string | null;
  declared_income?: string | null;
  assessed_income?: string | null;
  taxable_income?: string | null;
  tax_payable?: string | null;
  tax_paid?: string | null;
  outstanding_tax?: string | null;
  penalty_amount?: string | null;
  interest_amount?: string | null;
  assessment_status: AuditEntityTaxAssessmentStatus;
  appeal_status?: AuditEntityTaxAppealStatus | null;
  document_reference?: string | null;
  description?: string | null;
  remarks?: string | null;
};

export type AuditEntityTaxAssessmentUpdatePayload =
  Partial<AuditEntityTaxAssessmentPayload> & {
    is_active?: boolean;
  };

export type AuditEntityTaxAssessmentListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityTaxAssessment[];
};

export type AuditEntityTaxAssessmentMessageResponse = {
  message: string;
  data: AuditEntityTaxAssessment | null;
};

export type AuditEntityTaxAssessmentListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  audit_entity_id?: number;
  tax_year?: string;
  tax_type?: string;
  assessment_status?: string;
  appeal_status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

function buildQuery(params: AuditEntityTaxAssessmentListParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

async function parseApiError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail ?? data.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function requestJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as T;
}

export async function listAuditEntityTaxAssessments(
  params: AuditEntityTaxAssessmentListParams,
): Promise<AuditEntityTaxAssessmentListResponse> {
  const query = buildQuery(params);

  return requestJson<AuditEntityTaxAssessmentListResponse>(
    `/api/backend/audit-entity-tax-assessments${query ? `?${query}` : ""}`,
  );
}

export async function createAuditEntityTaxAssessment(
  payload: AuditEntityTaxAssessmentPayload,
): Promise<AuditEntityTaxAssessmentMessageResponse> {
  return requestJson<AuditEntityTaxAssessmentMessageResponse>(
    "/api/backend/audit-entity-tax-assessments",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditEntityTaxAssessment(
  assessmentId: number,
  payload: AuditEntityTaxAssessmentUpdatePayload,
): Promise<AuditEntityTaxAssessmentMessageResponse> {
  return requestJson<AuditEntityTaxAssessmentMessageResponse>(
    `/api/backend/audit-entity-tax-assessments/${assessmentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditEntityTaxAssessment(
  assessmentId: number,
): Promise<AuditEntityTaxAssessmentMessageResponse> {
  return requestJson<AuditEntityTaxAssessmentMessageResponse>(
    `/api/backend/audit-entity-tax-assessments/${assessmentId}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditEntityTaxAssessment(
  assessmentId: number,
): Promise<AuditEntityTaxAssessmentMessageResponse> {
  return requestJson<AuditEntityTaxAssessmentMessageResponse>(
    `/api/backend/audit-entity-tax-assessments/${assessmentId}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditEntityTaxAssessment(
  assessmentId: number,
): Promise<AuditEntityTaxAssessmentMessageResponse> {
  return requestJson<AuditEntityTaxAssessmentMessageResponse>(
    `/api/backend/audit-entity-tax-assessments/${assessmentId}/permanent`,
    {
      method: "DELETE",
    },
  );
}
