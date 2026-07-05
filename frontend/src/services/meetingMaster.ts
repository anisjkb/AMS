export type MeetingMaster = {
  meeting_id: number;
  meeting_type: string;
  client_id: number;
  client_code: string;
  audit_year: string;
  meeting_date: string;
  audit_start_date: string;
  audit_end_date: string;
  meeting_venue: string;
  meeting_note1: string;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingMasterListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: MeetingMaster[];
};

export type MeetingMasterPayload = {
  meeting_type: string;
  client_id: number;
  client_code: string;
  audit_year: string;
  meeting_date: string;
  audit_start_date: string;
  audit_end_date: string;
  meeting_venue: string;
  meeting_note1: string;
  status: string;
};

export type MeetingMasterUpdatePayload = Partial<MeetingMasterPayload> & {
  is_active?: boolean;
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
  query.set("sort_by", "meeting_id");
  query.set("sort_order", "desc");

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
      error?.detail || error?.message || "Meeting Master request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listMeetingMaster(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<MeetingMasterListResponse>(
    `/api/backend/meeting-master?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createMeetingMaster(payload: MeetingMasterPayload) {
  return requestJson<{ message: string; data: MeetingMaster }>(
    "/api/backend/meeting-master",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateMeetingMaster(
  id: number,
  payload: MeetingMasterUpdatePayload,
) {
  return requestJson<{ message: string; data: MeetingMaster }>(
    `/api/backend/meeting-master/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateMeetingMaster(id: number) {
  return requestJson<{ message: string; data: MeetingMaster }>(
    `/api/backend/meeting-master/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreMeetingMaster(id: number) {
  return requestJson<{ message: string; data: MeetingMaster }>(
    `/api/backend/meeting-master/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteMeetingMaster(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/meeting-master/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
