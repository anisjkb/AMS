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

export type MeetingType = {
  meeting_type_id: number;
  meeting_type_name: string;
  description: string | null;
  status: string;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingTypeListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: MeetingType[];
};

export type MeetingTypePayload = {
  meeting_type_name: string;
  description?: string | null;
  status: string;
};

export type MeetingTypeUpdatePayload = Partial<MeetingTypePayload> & {
  is_active?: boolean;
};

export type MeetingTypeListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  is_active?: boolean;
};

function buildQuery(params: MeetingTypeListParams = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listMeetingTypes(
  params: MeetingTypeListParams = {},
): Promise<MeetingTypeListResponse> {
  return requestJson<MeetingTypeListResponse>(
    `/api/backend/meeting-type${buildQuery(params)}`,
  );
}

export async function createMeetingType(
  payload: MeetingTypePayload,
): Promise<{ message: string; data: MeetingType | null }> {
  return requestJson<{ message: string; data: MeetingType | null }>(
    "/api/backend/meeting-type",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateMeetingType(
  meetingTypeId: number,
  payload: MeetingTypeUpdatePayload,
): Promise<{ message: string; data: MeetingType | null }> {
  return requestJson<{ message: string; data: MeetingType | null }>(
    `/api/backend/meeting-type/${meetingTypeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateMeetingType(
  meetingTypeId: number,
): Promise<{ message: string; data: MeetingType | null }> {
  return requestJson<{ message: string; data: MeetingType | null }>(
    `/api/backend/meeting-type/${meetingTypeId}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreMeetingType(
  meetingTypeId: number,
): Promise<{ message: string; data: MeetingType | null }> {
  return requestJson<{ message: string; data: MeetingType | null }>(
    `/api/backend/meeting-type/${meetingTypeId}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteMeetingType(
  meetingTypeId: number,
): Promise<{ message: string; data: MeetingType | null }> {
  return requestJson<{ message: string; data: MeetingType | null }>(
    `/api/backend/meeting-type/${meetingTypeId}/permanent`,
    {
      method: "DELETE",
    },
  );
}
