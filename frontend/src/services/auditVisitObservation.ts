export type AuditVisitObservation = {
  visit_observation_id: number;
  issue_id: number | null;
  audit_type: string;
  discussion_point: string;
  observation_discussion: string;
  observation_decision: string;
  visit_id: number | null;
  audit_id: number | null;
  team_id: number | null;
  observation_note: string | null;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditVisitObservationListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditVisitObservation[];
};

export type AuditVisitObservationPayload = {
  issue_id?: number | null;
  audit_type: string;
  discussion_point: string;
  observation_discussion: string;
  observation_decision: string;
  visit_id?: number | null;
  audit_id?: number | null;
  team_id?: number | null;
  observation_note?: string | null;
  status: string;
};

export type AuditVisitObservationUpdatePayload =
  Partial<AuditVisitObservationPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  issueId?: number;
  visitId?: number;
  auditId?: number;
  teamId?: number;
  auditType?: string;
  status?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "visit_observation_id");
  query.set("sort_order", "desc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.issueId) query.set("issue_id", String(params.issueId));
  if (params.visitId) query.set("visit_id", String(params.visitId));
  if (params.auditId) query.set("audit_id", String(params.auditId));
  if (params.teamId) query.set("team_id", String(params.teamId));
  if (params.auditType) query.set("audit_type", params.auditType);
  if (params.status) query.set("status", params.status);

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
      error?.detail ||
      error?.message ||
      "Audit Visit Observation request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditVisitObservations(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditVisitObservationListResponse>(
    `/api/backend/audit-visit-observations?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditVisitObservation(
  payload: AuditVisitObservationPayload,
) {
  return requestJson<{ message: string; data: AuditVisitObservation }>(
    "/api/backend/audit-visit-observations",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditVisitObservation(
  id: number,
  payload: AuditVisitObservationUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditVisitObservation }>(
    `/api/backend/audit-visit-observations/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditVisitObservation(id: number) {
  return requestJson<{ message: string; data: AuditVisitObservation }>(
    `/api/backend/audit-visit-observations/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditVisitObservation(id: number) {
  return requestJson<{ message: string; data: AuditVisitObservation }>(
    `/api/backend/audit-visit-observations/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditVisitObservation(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-visit-observations/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
