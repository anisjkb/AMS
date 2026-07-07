export type AuditType = {
  audit_type_id: number;
  audit_type_name: string;
  description: string | null;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditTypeListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditType[];
};

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
      error?.detail || error?.message || "Audit Type request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditTypes() {
  return requestJson<AuditTypeListResponse>(
    "/api/backend/audit-type?page=1&page_size=100&is_active=true&sort_by=audit_type_name&sort_order=asc",
    {
      method: "GET",
    },
  );
}
