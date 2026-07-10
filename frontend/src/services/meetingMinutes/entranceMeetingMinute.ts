export type EntranceMeetingMinute = {
  minute_id: number;
  meeting_id: number;
  chairman_participant_id: number;
  status: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;

  meeting_name: string | null;
  meeting_type: string | null;
  client_id: number | null;
  client_code: string | null;
  client_name: string | null;
  audit_year: string | null;
  meeting_date: string | null;
  audit_start_date: string | null;
  audit_end_date: string | null;
  meeting_venue: string | null;
  meeting_note1: string | null;

  chairman_name: string | null;
  chairman_designation: string | null;
};

export type EntranceMeetingMinutePayload = {
  meeting_id: number;
  chairman_participant_id: number;
  status: string;
};

export type EntranceMeetingMinuteUpdatePayload =
  Partial<EntranceMeetingMinutePayload> & {
    is_active?: boolean;
  };

export type EntranceMeetingMinuteListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: EntranceMeetingMinute[];
};

export type EntranceMeetingParticipantReportItem = {
  participant_id: number;
  participant_name: string | null;
  designation: string | null;
  source_type: string | null;
  source_label: string | null;
};

export type EntranceMeetingDiscussionReportItem = {
  id: number;
  title: string;
  description: string | null;
  decision: string | null;
};

export type EntranceMeetingOfficeReportItem = {
  label: string;
  address: string | null;
};

export type EntranceMeetingMinuteReport = {
  minute: EntranceMeetingMinute;
  internal_participants: EntranceMeetingParticipantReportItem[];
  client_participants: EntranceMeetingParticipantReportItem[];
  discussions: EntranceMeetingDiscussionReportItem[];
  offices: EntranceMeetingOfficeReportItem[];
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  meetingId?: number;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "minute_id");
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
      "Entrance Meeting Minutes request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listEntranceMeetingMinutes(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<EntranceMeetingMinuteListResponse>(
    `/api/backend/entrance-meeting-minutes?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createEntranceMeetingMinute(
  payload: EntranceMeetingMinutePayload,
) {
  return requestJson<{ message: string; data: EntranceMeetingMinute }>(
    "/api/backend/entrance-meeting-minutes",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateEntranceMeetingMinute(
  id: number,
  payload: EntranceMeetingMinuteUpdatePayload,
) {
  return requestJson<{ message: string; data: EntranceMeetingMinute }>(
    `/api/backend/entrance-meeting-minutes/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateEntranceMeetingMinute(id: number) {
  return requestJson<{ message: string; data: EntranceMeetingMinute }>(
    `/api/backend/entrance-meeting-minutes/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreEntranceMeetingMinute(id: number) {
  return requestJson<{ message: string; data: EntranceMeetingMinute }>(
    `/api/backend/entrance-meeting-minutes/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteEntranceMeetingMinute(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/entrance-meeting-minutes/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}

export async function getEntranceMeetingMinuteReport(id: number) {
  return requestJson<EntranceMeetingMinuteReport>(
    `/api/backend/entrance-meeting-minutes/${id}/report`,
    {
      method: "GET",
    },
  );
}

export async function downloadEntranceMeetingMinuteServerPdf(id: number) {
  const response = await fetch(
    `/api/backend/entrance-meeting-minutes/${id}/pdf`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error?.detail ||
      error?.message ||
      "Entrance Meeting Minutes server PDF request failed.";

    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `entrance-meeting-minutes-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
