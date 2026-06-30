export type AuditMaster = {
  audit_id: number;
  client_id: number;
  audit_type: string;
  audit_year: string;
  audit_start_date: string;
  audit_end_date: string;
  audit_note: string;
  status: string;
  audit_name: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditMasterListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditMaster[];
};

export type AuditMasterPayload = {
  client_id: number;
  audit_type: string;
  audit_year: string;
  audit_start_date: string;
  audit_end_date: string;
  audit_note: string;
  status: string;
  audit_name?: string | null;
};

export type AuditMasterUpdatePayload = Partial<AuditMasterPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  clientId?: number;
  auditType?: string;
  status?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "audit_id");
  query.set("sort_order", "desc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.clientId) query.set("client_id", String(params.clientId));
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
      error?.detail || error?.message || "Audit Master request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditMaster(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditMasterListResponse>(
    `/api/backend/audit-master?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditMaster(payload: AuditMasterPayload) {
  return requestJson<{ message: string; data: AuditMaster }>(
    "/api/backend/audit-master",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditMaster(
  id: number,
  payload: AuditMasterUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditMaster }>(
    `/api/backend/audit-master/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditMaster(id: number) {
  return requestJson<{ message: string; data: AuditMaster }>(
    `/api/backend/audit-master/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditMaster(id: number) {
  return requestJson<{ message: string; data: AuditMaster }>(
    `/api/backend/audit-master/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditMaster(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-master/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
