export type AuditVisitInfo = {
  visit_id: number;
  audit_id: number;
  team_id: number;
  client_address_id: number;
  visit_date: string;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditVisitInfoListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditVisitInfo[];
};

export type AuditVisitInfoPayload = {
  audit_id: number;
  team_id: number;
  client_address_id: number;
  visit_date: string;
  status: string;
};

export type AuditVisitInfoUpdatePayload = Partial<AuditVisitInfoPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditId?: number;
  teamId?: number;
  status?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "visit_id");
  query.set("sort_order", "desc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.auditId) query.set("audit_id", String(params.auditId));
  if (params.teamId) query.set("team_id", String(params.teamId));
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
      error?.detail || error?.message || "Audit Visit Info request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditVisitInfo(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditVisitInfoListResponse>(
    `/api/backend/audit-visit-info?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditVisitInfo(payload: AuditVisitInfoPayload) {
  return requestJson<{ message: string; data: AuditVisitInfo }>(
    "/api/backend/audit-visit-info",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditVisitInfo(
  id: number,
  payload: AuditVisitInfoUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditVisitInfo }>(
    `/api/backend/audit-visit-info/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditVisitInfo(id: number) {
  return requestJson<{ message: string; data: AuditVisitInfo }>(
    `/api/backend/audit-visit-info/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditVisitInfo(id: number) {
  return requestJson<{ message: string; data: AuditVisitInfo }>(
    `/api/backend/audit-visit-info/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditVisitInfo(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-visit-info/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
