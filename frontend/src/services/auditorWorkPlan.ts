export type AuditorWorkPlan = {
  plan_id: number;
  report_id: number;
  work_plan_details: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditorWorkPlanListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditorWorkPlan[];
};

export type AuditorWorkPlanPayload = {
  report_id: number;
  work_plan_details: string;
};

export type AuditorWorkPlanUpdatePayload = Partial<AuditorWorkPlanPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  reportId?: number;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "plan_id");
  query.set("sort_order", "desc");

  if (params.search) {
    query.set("search", params.search);
  }

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.reportId) {
    query.set("report_id", String(params.reportId));
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
      error?.detail || error?.message || "Auditor Work Plan request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditorWorkPlans(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditorWorkPlanListResponse>(
    `/api/backend/auditor-work-plan?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditorWorkPlan(payload: AuditorWorkPlanPayload) {
  return requestJson<{ message: string; data: AuditorWorkPlan }>(
    "/api/backend/auditor-work-plan",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAuditorWorkPlan(
  id: number,
  payload: AuditorWorkPlanUpdatePayload,
) {
  return requestJson<{ message: string; data: AuditorWorkPlan }>(
    `/api/backend/auditor-work-plan/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateAuditorWorkPlan(id: number) {
  return requestJson<{ message: string; data: AuditorWorkPlan }>(
    `/api/backend/auditor-work-plan/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreAuditorWorkPlan(id: number) {
  return requestJson<{ message: string; data: AuditorWorkPlan }>(
    `/api/backend/auditor-work-plan/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteAuditorWorkPlan(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/auditor-work-plan/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
