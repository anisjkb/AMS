async function requestJson<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      message = data?.detail || data?.message || message;
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type MeetingMaster = {
  meeting_id: number;
  meeting_name: string;
  meeting_type_id: number;
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
  created_by?: string | null;
  updated_by?: string | null;
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
  meeting_name: string;
  meeting_type_id: number;
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

export type MeetingMasterListParams = {
  page?: number;
  page_size?: number;
  pageSize?: number;
  search?: string;
  sort_by?: string;
  sortBy?: string;
  sort_order?: "asc" | "desc";
  sortOrder?: "asc" | "desc";
  is_active?: boolean;
  isActive?: boolean;
};

function buildQuery(params: MeetingMasterListParams = {}): string {
  const normalizedParams = {
    page: params.page,
    page_size: params.page_size ?? params.pageSize,
    search: params.search,
    sort_by: params.sort_by ?? params.sortBy,
    sort_order: params.sort_order ?? params.sortOrder,
    is_active: params.is_active ?? params.isActive,
  };

  const searchParams = new URLSearchParams();

  Object.entries(normalizedParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listMeetingMaster(
  params: MeetingMasterListParams = {},
): Promise<MeetingMasterListResponse> {
  return requestJson<MeetingMasterListResponse>(
    `/api/backend/meeting-master${buildQuery(params)}`,
  );
}

export async function createMeetingMaster(
  payload: MeetingMasterPayload,
): Promise<{ message: string; data: MeetingMaster | null }> {
  return requestJson<{ message: string; data: MeetingMaster | null }>(
    "/api/backend/meeting-master",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateMeetingMaster(
  meetingId: number,
  payload: MeetingMasterUpdatePayload,
): Promise<{ message: string; data: MeetingMaster | null }> {
  return requestJson<{ message: string; data: MeetingMaster | null }>(
    `/api/backend/meeting-master/${meetingId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateMeetingMaster(
  meetingId: number,
): Promise<{ message: string; data: MeetingMaster | null }> {
  return requestJson<{ message: string; data: MeetingMaster | null }>(
    `/api/backend/meeting-master/${meetingId}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreMeetingMaster(
  meetingId: number,
): Promise<{ message: string; data: MeetingMaster | null }> {
  return requestJson<{ message: string; data: MeetingMaster | null }>(
    `/api/backend/meeting-master/${meetingId}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteMeetingMaster(
  meetingId: number,
): Promise<{ message: string; data: MeetingMaster | null }> {
  return requestJson<{ message: string; data: MeetingMaster | null }>(
    `/api/backend/meeting-master/${meetingId}/permanent`,
    {
      method: "DELETE",
    },
  );
}
