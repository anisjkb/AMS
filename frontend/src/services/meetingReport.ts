export type MeetingReport = {
  report_id: number;
  meeting_id: number | null;
  meeting_type: string;
  client_name: string;
  audit_year: string;
  meeting_date: string;
  location: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingReportListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: MeetingReport[];
};

export type MeetingReportPayload = {
  meeting_id: number;
  location?: string | null;
};

export type MeetingReportUpdatePayload = Partial<MeetingReportPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  meetingId?: number;
  auditYear?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "report_id");
  query.set("sort_order", "desc");

  if (params.search) {
    query.set("search", params.search);
  }

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.meetingId) {
    query.set("meeting_id", String(params.meetingId));
  }

  if (params.auditYear) {
    query.set("audit_year", params.auditYear);
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
      error?.detail || error?.message || "Meeting Report request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listMeetingReports(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<MeetingReportListResponse>(
    `/api/backend/meeting-reports?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createMeetingReport(payload: MeetingReportPayload) {
  return requestJson<{ message: string; data: MeetingReport }>(
    "/api/backend/meeting-reports",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateMeetingReport(
  id: number,
  payload: MeetingReportUpdatePayload,
) {
  return requestJson<{ message: string; data: MeetingReport }>(
    `/api/backend/meeting-reports/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateMeetingReport(id: number) {
  return requestJson<{ message: string; data: MeetingReport }>(
    `/api/backend/meeting-reports/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreMeetingReport(id: number) {
  return requestJson<{ message: string; data: MeetingReport }>(
    `/api/backend/meeting-reports/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteMeetingReport(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/meeting-reports/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
