export type GeneralDiscussion = {
  id: number;
  audit_id?: number | null;
  audit_type: string;
  title: string;
  description: string | null;
  decision: string | null;
  created_by?: number | null;
  status: string;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type GeneralDiscussionPayload = {
  audit_id?: number | null;
  audit_type: string;
  title: string;
  description?: string | null;
  decision?: string | null;
  created_by?: number | null;
  status: string;
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  isActive?: boolean;
};

export type PaginatedGeneralDiscussionResponse = {
  items: GeneralDiscussion[];
  total: number;
  page: number;
  page_size: number;
  [key: string]: unknown;
};

function buildQuery(p: ListParams) {
  const q = new URLSearchParams();

  q.set("page", String(p.page));
  q.set("page_size", String(p.pageSize));

  if (p.search) q.set("search", p.search);
  if (p.status && p.status !== "all") q.set("status", p.status);
  if (typeof p.isActive === "boolean") {
    q.set("is_active", String(p.isActive));
  }

  return q.toString();
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export async function listGeneralDiscussions(
  params: ListParams
): Promise<PaginatedGeneralDiscussionResponse> {
  const query = buildQuery(params);

  const response = await requestJson<Partial<PaginatedGeneralDiscussionResponse>>(
    `/api/backend/general-discussions?${query}`,
    { method: "GET" }
  );

  const items = response.items ?? [];
  const total = typeof response.total === "number" ? response.total : items.length;

  return {
    items,
    total,
    page: response.page ?? params.page,
    page_size: response.page_size ?? params.pageSize,
    ...response,
  };
}

export function createGeneralDiscussion(
  payload: GeneralDiscussionPayload
): Promise<GeneralDiscussion> {
  return requestJson<GeneralDiscussion>("/api/backend/general-discussions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGeneralDiscussion(
  id: number,
  payload: Partial<GeneralDiscussionPayload>
): Promise<GeneralDiscussion> {
  return requestJson<GeneralDiscussion>(`/api/backend/general-discussions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deactivateGeneralDiscussion(id: number): Promise<GeneralDiscussion> {
  return requestJson<GeneralDiscussion>(`/api/backend/general-discussions/${id}`, {
    method: "DELETE",
  });
}

export function restoreGeneralDiscussion(id: number): Promise<GeneralDiscussion> {
  return requestJson<GeneralDiscussion>(
    `/api/backend/general-discussions/${id}/restore`,
    { method: "PATCH" }
  );
}

export function permanentDeleteGeneralDiscussion(
  id: number
): Promise<{ message?: string }> {
  return requestJson<{ message?: string }>(
    `/api/backend/general-discussions/${id}/permanent`,
    { method: "DELETE" }
  );
}
