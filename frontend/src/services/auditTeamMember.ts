export type AuditTeamMember = {
  team_member_id: number;
  team_id: number;
  member_type: string;
  emp_id: string;
  team_member_role: string;
  note: string | null;
  br_id: string | null;
  client_id: number | null;
  client_contact_id: number | null;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditTeamMemberListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditTeamMember[];
};

export type AuditTeamMemberPayload = {
  team_id: number;
  member_type: string;
  emp_id: string;
  team_member_role: string;
  note?: string | null;
  br_id?: string | null;
  client_id?: number | null;
  client_contact_id?: number | null;
  status: string;
};

export type AuditTeamMemberUpdatePayload = Partial<AuditTeamMemberPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  teamId?: number;
  memberType?: string;
  status?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "team_member_id");
  query.set("sort_order", "desc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.teamId) query.set("team_id", String(params.teamId));
  if (params.memberType) query.set("member_type", params.memberType);
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
      error?.detail || error?.message || "Audit Team Member request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditTeamMembers(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditTeamMemberListResponse>(
    `/api/backend/audit-team-members?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditTeamMember(payload: AuditTeamMemberPayload) {
  return requestJson<{ message: string; data: AuditTeamMember }>(
    "/api/backend/audit-team-members",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditTeamMember(
  id: number,
  payload: AuditTeamMemberUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditTeamMember }>(
    `/api/backend/audit-team-members/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditTeamMember(id: number) {
  return requestJson<{ message: string; data: AuditTeamMember }>(
    `/api/backend/audit-team-members/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditTeamMember(id: number) {
  return requestJson<{ message: string; data: AuditTeamMember }>(
    `/api/backend/audit-team-members/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditTeamMember(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-team-members/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
