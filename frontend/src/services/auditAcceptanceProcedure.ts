export type AuditAcceptAnswerValue = "yes" | "no";

export type AuditAcceptItemType =
  | "section"
  | "question"
  | "note"
  | "safeguard"
  | "conclusion"
  | "signature";

export type AuditAcceptResponseType =
  | "none"
  | "yes_no";

export type AuditAcceptAuditContext = {
  audit_id: number;
  client_id: number;
  client_name: string;
  audit_name: string | null;
  audit_type: string;
  audit_year: string;
  year_end_date: string;
};

export type AuditAcceptSelectorItem = {
  audit_id: number;
  audit_year: string;
  client_id: number;
  client_name: string;
  audit_name: string | null;
  audit_type: string;
};

export type AuditAcceptSelectorResponse = {
  items: AuditAcceptSelectorItem[];
};

export type AuditAcceptTemplate = {
  template_id: number;
  template_key: string;
  template_name: string;
  reference_no: string | null;
  version: string;
  intro_text: string | null;
  effective_from: string | null;
  effective_to: string | null;
};

export type AuditAcceptItem = {
  item_id: number;
  template_id: number;
  parent_item_id: number | null;
  item_type: AuditAcceptItemType;
  item_key: string;
  item_no: string | null;
  title: string | null;
  content: string | null;
  response_type: AuditAcceptResponseType;
  sort_order: number;
  is_required: boolean;
  response_id: number | null;
  answer_value: AuditAcceptAnswerValue | null;
  response_updated_at: string | null;
};

export type AuditAcceptPageResponse = {
  audit: AuditAcceptAuditContext;
  template: AuditAcceptTemplate;
  items: AuditAcceptItem[];
  total_question_count: number;
  answered_count: number;
};

export type AuditAcceptAnswerInput = {
  item_id: number;
  answer_value: AuditAcceptAnswerValue | null;
};

export type AuditAcceptBulkSavePayload = {
  template_id: number;
  answers: AuditAcceptAnswerInput[];
};

export type AuditAcceptSaveResponse = {
  message: string;
  saved_count: number;
  data: AuditAcceptPageResponse;
};

const AUDIT_ACCEPTANCE_BASE_URL =
  "/api/backend/audit-acceptance";

async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    const message =
      error?.detail ||
      error?.message ||
      "Acceptance Procedures request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditAcceptanceSelectorOptions(): Promise<AuditAcceptSelectorResponse> {
  return requestJson<AuditAcceptSelectorResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/selector-options`,
    {
      method: "GET",
    },
  );
}

export async function getAuditAcceptancePage(
  auditId: number,
): Promise<AuditAcceptPageResponse> {
  return requestJson<AuditAcceptPageResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/${auditId}`,
    {
      method: "GET",
    },
  );
}

export async function saveAuditAcceptanceResponses(
  auditId: number,
  payload: AuditAcceptBulkSavePayload,
): Promise<AuditAcceptSaveResponse> {
  return requestJson<AuditAcceptSaveResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/${auditId}/responses`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}
