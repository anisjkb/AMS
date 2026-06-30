export type AuditTeam = {
  team_id: number;
  team_name: string;
  team_note: string | null;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditTeamListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditTeam[];
};

export type AuditTeamPayload = {
  team_name: string;
  team_note?: string | null;
  status: string;
};

export type AuditTeamUpdatePayload = Partial<AuditTeamPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  status?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "team_id");
  query.set("sort_order", "desc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

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
      error?.detail || error?.message || "Audit Team request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditTeams(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditTeamListResponse>(
    `/api/backend/audit-teams?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditTeam(payload: AuditTeamPayload) {
  return requestJson<{ message: string; data: AuditTeam }>(
    "/api/backend/audit-teams",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditTeam(
  id: number,
  payload: AuditTeamUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditTeam }>(
    `/api/backend/audit-teams/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditTeam(id: number) {
  return requestJson<{ message: string; data: AuditTeam }>(
    `/api/backend/audit-teams/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditTeam(id: number) {
  return requestJson<{ message: string; data: AuditTeam }>(
    `/api/backend/audit-teams/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditTeam(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-teams/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
