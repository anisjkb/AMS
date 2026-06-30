export type MeetingParticipant = {
  participant_id: number;
  report_id: number;
  name: string;
  designation: string | null;
  signature: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingParticipantListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: MeetingParticipant[];
};

export type MeetingParticipantPayload = {
  report_id: number;
  name: string;
  designation?: string | null;
  signature?: string | null;
};

export type MeetingParticipantUpdatePayload = Partial<MeetingParticipantPayload> & {
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
  query.set("sort_by", "participant_id");
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
      error?.detail || error?.message || "Meeting Participant request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listMeetingParticipants(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<MeetingParticipantListResponse>(
    `/api/backend/meeting-participants?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createMeetingParticipant(payload: MeetingParticipantPayload) {
  return requestJson<{ message: string; data: MeetingParticipant }>(
    "/api/backend/meeting-participants",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateMeetingParticipant(
  id: number,
  payload: MeetingParticipantUpdatePayload,
) {
  return requestJson<{ message: string; data: MeetingParticipant }>(
    `/api/backend/meeting-participants/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateMeetingParticipant(id: number) {
  return requestJson<{ message: string; data: MeetingParticipant }>(
    `/api/backend/meeting-participants/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreMeetingParticipant(id: number) {
  return requestJson<{ message: string; data: MeetingParticipant }>(
    `/api/backend/meeting-participants/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteMeetingParticipant(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/meeting-participants/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
