async function requestJson<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      message = data?.detail || data?.message || message;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type AuditType = {
  audit_type_id: number;
  audit_type_name: string;
  description: string | null;
  status: string;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditTypeListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditType[];
};

export type AuditTypePayload = {
  audit_type_name: string;
  description?: string | null;
  status: string;
};

export type AuditTypeUpdatePayload = Partial<AuditTypePayload> & {
  is_active?: boolean;
};

export type AuditTypeListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  is_active?: boolean;
  status?: string;
};

function buildQuery(params: AuditTypeListParams = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listAuditTypes(
  params: AuditTypeListParams = {},
): Promise<AuditTypeListResponse> {
  return requestJson<AuditTypeListResponse>(
    `/api/backend/audit-type${buildQuery(params)}`,
  );
}

export async function createAuditType(
  payload: AuditTypePayload,
): Promise<{ message: string; data: AuditType | null }> {
  return requestJson<{ message: string; data: AuditType | null }>(
    "/api/backend/audit-type",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditType(
  auditTypeId: number,
  payload: AuditTypeUpdatePayload,
): Promise<{ message: string; data: AuditType | null }> {
  return requestJson<{ message: string; data: AuditType | null }>(
    `/api/backend/audit-type/${auditTypeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditType(
  auditTypeId: number,
): Promise<{ message: string; data: AuditType | null }> {
  return requestJson<{ message: string; data: AuditType | null }>(
    `/api/backend/audit-type/${auditTypeId}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditType(
  auditTypeId: number,
): Promise<{ message: string; data: AuditType | null }> {
  return requestJson<{ message: string; data: AuditType | null }>(
    `/api/backend/audit-type/${auditTypeId}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditType(
  auditTypeId: number,
): Promise<{ message: string; data: AuditType | null }> {
  return requestJson<{ message: string; data: AuditType | null }>(
    `/api/backend/audit-type/${auditTypeId}/permanent`,
    {
      method: "DELETE",
    },
  );
}
