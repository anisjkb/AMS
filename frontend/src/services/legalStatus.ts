export type LegalStatus = {
  id: number;
  legal_status_code: string;
  legal_status_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type LegalStatusListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: LegalStatus[];
};

type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
};

function buildQuery(params: ListParams = {}) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("page_size", String(params.pageSize ?? 100));
  query.set("sort_by", "id");
  query.set("sort_order", "asc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  return query.toString();
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
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
      error?.detail || error?.message || "Legal status request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listLegalStatuses(params: ListParams = {}) {
  const query = buildQuery(params);

  return requestJson<LegalStatusListResponse>(
    `/api/backend/legal-statuses?${query}`,
    {
      method: "GET",
    },
  );
}
