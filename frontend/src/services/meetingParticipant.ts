export type MeetingParticipantSourceType =
  | "internal_audit_team"
  | "client_entity_team";

export type MeetingParticipant = {
  participant_id: number;
  meeting_id: number;
  meeting_name: string | null;
  meeting_type_id: number | null;
  meeting_type: string | null;
  client_id: number | null;
  client_code: string | null;
  source_type: MeetingParticipantSourceType;
  source_label: string | null;
  audit_team_id: number | null;
  audit_team_name: string | null;
  audit_team_member_id: number | null;
  entity_contact_id: number | null;
  participant_name: string | null;
  designation: string | null;
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
  meeting_id: number;
  source_type: MeetingParticipantSourceType;
  audit_team_id?: number | null;
  entity_contact_id?: number | null;
};

export type InternalTeamOption = {
  team_id: number;
  team_name: string;
  member_count: number;
};

export type EntityContactOption = {
  id: number;
  audit_entity_id: number;
  contact_name: string;
  designation: string | null;
  department: string | null;
  email: string | null;
  mobile: string | null;
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
  query.set("sort_by", "participant_id");
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

export async function listMeetingParticipantInternalTeams() {
  return requestJson<{ items: InternalTeamOption[] }>(
    "/api/backend/meeting-participants/options/internal-teams",
    {
      method: "GET",
    },
  );
}

export async function listMeetingParticipantEntityContacts(meetingId: number) {
  return requestJson<{ items: EntityContactOption[] }>(
    `/api/backend/meeting-participants/options/entity-contacts?meeting_id=${meetingId}`,
    {
      method: "GET",
    },
  );
}

export async function createMeetingParticipant(payload: MeetingParticipantPayload) {
  return requestJson<{ message: string; data: MeetingParticipant[] }>(
    "/api/backend/meeting-participants",
    {
      method: "POST",
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
