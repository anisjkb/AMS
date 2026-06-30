export type AuditDiscussionIssue = {
  issue_id: number;
  audit_type: string;
  discussion_point: string;
  default_decision: string;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditDiscussionIssueListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditDiscussionIssue[];
};

export type AuditDiscussionIssuePayload = {
  audit_type: string;
  discussion_point: string;
  default_decision: string;
  status: string;
};

export type AuditDiscussionIssueUpdatePayload =
  Partial<AuditDiscussionIssuePayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditType?: string;
  status?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "issue_id");
  query.set("sort_order", "desc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

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
      "Audit Discussion Issue request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditDiscussionIssues(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditDiscussionIssueListResponse>(
    `/api/backend/audit-discussion-issues?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditDiscussionIssue(
  payload: AuditDiscussionIssuePayload,
) {
  return requestJson<{ message: string; data: AuditDiscussionIssue }>(
    "/api/backend/audit-discussion-issues",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditDiscussionIssue(
  id: number,
  payload: AuditDiscussionIssueUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditDiscussionIssue }>(
    `/api/backend/audit-discussion-issues/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditDiscussionIssue(id: number) {
  return requestJson<{ message: string; data: AuditDiscussionIssue }>(
    `/api/backend/audit-discussion-issues/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditDiscussionIssue(id: number) {
  return requestJson<{ message: string; data: AuditDiscussionIssue }>(
    `/api/backend/audit-discussion-issues/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditDiscussionIssue(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-discussion-issues/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
