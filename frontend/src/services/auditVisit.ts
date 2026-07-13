export type AuditVisit = {
  visit_id: number;
  visit_name: string | null;

  audit_id: number;
  team_id: number;
  client_address_id: number;

  visit_date: string;
  status: string;

  observation_count: number;

  is_active: boolean;
  created_at: string;
  updated_at: string;

  created_by: string | null;
  updated_by: string | null;
};


export type AuditVisitListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditVisit[];
};


type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
};


function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));

  if (params.search) {
    query.set("search", params.search);
  }

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
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
      error?.detail ||
      error?.message ||
      "Audit Visit request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}


export async function listAuditVisits(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditVisitListResponse>(
    `/api/backend/audit-visits?${query}`,
    {
      method: "GET",
    },
  );
}
