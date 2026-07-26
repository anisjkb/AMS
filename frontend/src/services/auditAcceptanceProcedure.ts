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

type ApiErrorRecord = Record<
  string,
  unknown
>;

function isApiErrorRecord(
  value: unknown,
): value is ApiErrorRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function collectApiErrorMessages(
  value: unknown,
): string[] {
  if (typeof value === "string") {
    const message = value.trim();

    return message ? [message] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(
      collectApiErrorMessages,
    );
  }

  if (!isApiErrorRecord(value)) {
    return [];
  }

  const messages: string[] = [];

  for (const key of [
    "message",
    "error",
  ]) {
    const directValue = value[key];

    if (
      typeof directValue === "string" &&
      directValue.trim()
    ) {
      messages.push(
        directValue.trim(),
      );
    }
  }

  const validationMessage =
    typeof value.msg === "string"
      ? value.msg.trim()
      : "";

  const location = Array.isArray(value.loc)
    ? value.loc
        .map((part) => String(part))
        .filter(
          (part) =>
            part !== "body" &&
            part !== "query" &&
            part !== "path",
        )
        .join(".")
    : "";

  if (validationMessage) {
    messages.push(
      location
        ? `${location}: ${validationMessage}`
        : validationMessage,
    );
  }

  for (const key of [
    "detail",
    "errors",
    "validation_errors",
  ]) {
    if (key in value) {
      messages.push(
        ...collectApiErrorMessages(
          value[key],
        ),
      );
    }
  }

  return messages;
}

function formatAcceptanceApiError(
  payload: unknown,
  status: number,
): string {
  const messages = Array.from(
    new Set(
      collectApiErrorMessages(payload),
    ),
  );

  if (messages.length > 0) {
    return messages.join(" ");
  }

  return `Request failed with status ${status}.`;
}

async function requestJson<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload: unknown =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      formatAcceptanceApiError(
        payload,
        response.status,
      ),
    );
  }

  return payload as T;
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


export type AuditAcceptWorkflowStatus =
  | "draft"
  | "submitted"
  | "pending_partner_signoff"
  | "pending_consultation"
  | "changes_requested"
  | "completed"
  | "reopened";

export type AuditAcceptDecision =
  | "accept"
  | "accept_with_safeguards"
  | "do_not_accept";

export type AuditAcceptSignoffRole =
  | "engagement_partner"
  | "second_partner"
  | "quality_reviewer";

export type AuditAcceptCompletionAudit = {
  audit_id: number;
  client_id: number;
  client_name: string;
  audit_name: string | null;
  audit_type: string | null;
  audit_year: string;
  year_end_date: string | null;
};

export type AuditAcceptCompletionTemplate = {
  template_id: number;
  template_key: string;
  template_name: string;
  reference_no: string | null;
  version: string;
};

export type AuditAcceptCompletion = {
  completion_id: number | null;
  audit_id: number;
  template_id: number;

  template_key: string;
  template_version: string;
  reference_no: string | null;

  file_no: string | null;

  workflow_status: AuditAcceptWorkflowStatus;
  workflow_version: number;

  safeguards_text: string | null;
  no_safeguard_required: boolean;

  acceptance_decision:
    | AuditAcceptDecision
    | null;

  conclusion_remarks: string | null;

  confirm_relevant_information: boolean;
  confirm_independence_evaluated: boolean;
  confirm_threats_addressed: boolean;
  confirm_safeguards_applied: boolean;
  confirm_conclusion_documented: boolean;

  consultation_required: boolean;
  consultation_remarks: string | null;

  submitted_by_user_id: string | null;
  submitted_at: string | null;
  completed_at: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AuditAcceptSignoff = {
  signoff_id: number;
  completion_id: number;

  signoff_role: AuditAcceptSignoffRole;
  workflow_version: number;

  signed_by_employee_id: number;
  signed_by_user_id: string;

  signed_by_name: string;
  signed_by_designation: string | null;

  declaration_text: string | null;
  remarks: string | null;

  signed_at: string;
  is_current: boolean;

  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AuditAcceptCompletionStateResponse = {
  audit: AuditAcceptCompletionAudit;
  template: AuditAcceptCompletionTemplate;
  exists: boolean;
  completion: AuditAcceptCompletion;
  signoffs: AuditAcceptSignoff[];
};

export type AuditAcceptCompletionSavePayload = {
  template_id: number;
  file_no: string | null;

  safeguards_text: string | null;
  no_safeguard_required: boolean;

  acceptance_decision:
    | AuditAcceptDecision
    | null;

  conclusion_remarks: string | null;

  confirm_relevant_information: boolean;
  confirm_independence_evaluated: boolean;
  confirm_threats_addressed: boolean;
  confirm_safeguards_applied: boolean;
  confirm_conclusion_documented: boolean;

  consultation_required: boolean;
  consultation_remarks: string | null;
};

export type AuditAcceptCompletionSaveResponse = {
  message: string;
  data: AuditAcceptCompletion;
};

export type AuditAcceptCompletionSubmitPayload = {
  expected_workflow_version: number;
};

export type AuditAcceptCompletionSubmitResponse = {
  message: string;
  data: AuditAcceptCompletion;
};

export type AuditAcceptSignerOption = {
  employee_id: number;
  employee_code: string | null;
  official_employee_id: string | null;

  employee_name: string;

  designation_id: number;
  designation_name: string;

  signature_url: string | null;
};

export type AuditAcceptSignerOptionsResponse = {
  items: AuditAcceptSignerOption[];
};

export type AuditAcceptEngagementPartnerSignoffPayload = {
  employee_id: number;
  expected_workflow_version: number;
  declaration_text: string | null;
  remarks: string | null;
};

export type AuditAcceptEngagementPartnerSignoffData = {
  completion: AuditAcceptCompletion;
  signoff: AuditAcceptSignoff;
};

export type AuditAcceptEngagementPartnerSignoffResponse = {
  message: string;
  data: AuditAcceptEngagementPartnerSignoffData;
};

export async function getAuditAcceptanceCompletionState(
  auditId: number,
): Promise<AuditAcceptCompletionStateResponse> {
  return requestJson<AuditAcceptCompletionStateResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/${auditId}/completion`,
    {
      method: "GET",
    },
  );
}

export async function saveAuditAcceptanceCompletion(
  auditId: number,
  payload: AuditAcceptCompletionSavePayload,
): Promise<AuditAcceptCompletionSaveResponse> {
  return requestJson<AuditAcceptCompletionSaveResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/${auditId}/completion`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function submitAuditAcceptanceCompletion(
  auditId: number,
  payload: AuditAcceptCompletionSubmitPayload,
): Promise<AuditAcceptCompletionSubmitResponse> {
  return requestJson<AuditAcceptCompletionSubmitResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/${auditId}/completion/submit`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function listAuditAcceptanceSignerOptions(): Promise<AuditAcceptSignerOptionsResponse> {
  return requestJson<AuditAcceptSignerOptionsResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/signer-options`,
    {
      method: "GET",
    },
  );
}

export async function signAuditAcceptanceEngagementPartner(
  auditId: number,
  payload: AuditAcceptEngagementPartnerSignoffPayload,
): Promise<AuditAcceptEngagementPartnerSignoffResponse> {
  return requestJson<AuditAcceptEngagementPartnerSignoffResponse>(
    `${AUDIT_ACCEPTANCE_BASE_URL}/${auditId}/completion/signoffs/engagement-partner`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
