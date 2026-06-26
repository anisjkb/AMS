export type AuditSubjectType =
  | "firm"
  | "project"
  | "incident"
  | "branch"
  | "department"
  | "process"
  | "audit_entity";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type AuditSubject = {
  id: number;
  subject_code: string;
  subject_name: string;
  subject_type: AuditSubjectType;
  reference_code: string | null;
  owner_department: string | null;
  location: string | null;
  risk_level: RiskLevel | null;
  is_confidential: boolean;
  description: string | null;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditSubjectListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditSubject[];
};

export type AuditSubjectPayload = {
  subject_code?: string | null;
  subject_name: string;
  subject_type: AuditSubjectType;
  reference_code?: string | null;
  owner_department?: string | null;
  location?: string | null;
  risk_level?: RiskLevel | null;
  is_confidential: boolean;
  description?: string | null;
  remarks?: string | null;
};

export type AuditSubjectUpdatePayload = Partial<AuditSubjectPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  subjectType?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "id");
  query.set("sort_order", "asc");

  if (params.search) {
    query.set("search", params.search);
  }

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.subjectType) {
    query.set("subject_type", params.subjectType);
  }

  return query.toString();
}

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
    const error = await response.json().catch(() => null);
    const message =
      error?.detail || error?.message || "Audit Subject request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditSubjects(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditSubjectListResponse>(
    `/api/backend/audit-subjects?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditSubject(payload: AuditSubjectPayload) {
  return requestJson<{ message: string; data: AuditSubject }>(
    "/api/backend/audit-subjects",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditSubject(
  id: number,
  payload: AuditSubjectUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditSubject }>(
    `/api/backend/audit-subjects/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditSubject(id: number) {
  return requestJson<{ message: string; data: AuditSubject }>(
    `/api/backend/audit-subjects/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditSubject(id: number) {
  return requestJson<{ message: string; data: AuditSubject }>(
    `/api/backend/audit-subjects/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditSubject(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-subjects/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
