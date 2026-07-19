export type ExitMeetingMinute = {
  minute_id: number;
  meeting_id: number;
  chairman_participant_id: number;

  status: string;
  is_active: boolean;

  is_locked: boolean;
  locked_at: string | null;
  locked_by_user_id: string | null;
  template_key: string | null;
  template_version: string | null;
  snapshot_version: number;
  snapshot_data: Record<string, unknown> | null;
  snapshot_hash: string | null;

  workflow_status: ExitMeetingWorkflowStatus;
  workflow_version: number;
  unlock_cycle_number: number;

  submitted_by_user_id: string | null;
  submitted_at: string | null;

  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  review_note: string | null;

  current_edit_scope: string[] | null;
  edit_approved_until: string | null;

  last_workflow_by_user_id: string | null;
  last_workflow_at: string | null;

  current_snapshot_id: number | null;
  current_unlock_request_id: number | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;

  meeting_name: string | null;
  meeting_type: string | null;
  meeting_date: string | null;
  meeting_venue: string | null;
  meeting_note1: string | null;

  audit_id: number | null;
  audit_name: string | null;
  audit_type: string | null;
  audit_year: string | null;
  audit_start_date: string | null;
  audit_end_date: string | null;

  client_id: number | null;
  client_code: string | null;
  client_name: string | null;

  chairman_name: string | null;
  chairman_designation: string | null;
};

export type ExitMeetingMinutePayload = {
  meeting_id: number;
  chairman_participant_id: number;
  status: string;
};

export type ExitMeetingMinuteUpdatePayload =
  Partial<ExitMeetingMinutePayload> & {
    is_active?: boolean;
  };

export type ExitMeetingMinuteListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: ExitMeetingMinute[];
};

export type ExitMeetingParticipantReportItem = {
  participant_id: number;
  participant_name: string | null;
  designation: string | null;
  source_type: string | null;
  source_label: string | null;
};

export type ExitMeetingFindingReportItem = {
  visit_observation_id: number;
  visit_id: number | null;
  visit_date: string | null;
  discussion_point: string | null;
  observation_discussion: string | null;
  observation_decision: string | null;
};

export type ExitMeetingMinuteReport = {
  minute: ExitMeetingMinute;
  internal_participants: ExitMeetingParticipantReportItem[];
  client_participants: ExitMeetingParticipantReportItem[];
  visit_dates: string[];
  findings: ExitMeetingFindingReportItem[];
};

export type ExitMeetingMinuteMessageResponse = {
  message: string;
  data: ExitMeetingMinute | null;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  meetingId?: number;
  isLocked?: boolean;
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
    query.set(
      "is_active",
      String(params.isActive),
    );
  }

  if (params.meetingId) {
    query.set(
      "meeting_id",
      String(params.meetingId),
    );
  }

  if (typeof params.isLocked === "boolean") {
    query.set(
      "is_locked",
      String(params.isLocked),
    );
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
    const error = await response
      .json()
      .catch(() => null);

    const message =
      error?.detail ||
      error?.message ||
      "Exit Meeting Minutes request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listExitMeetingMinutes(
  params: ListParams,
) {
  const query = buildQuery(params);

  return requestJson<ExitMeetingMinuteListResponse>(
    `/api/backend/exit-meeting-minutes?${query}`,
    {
      method: "GET",
    },
  );
}

export async function getExitMeetingMinute(
  id: number,
) {
  return requestJson<ExitMeetingMinute>(
    `/api/backend/exit-meeting-minutes/${id}`,
    {
      method: "GET",
    },
  );
}

export async function createExitMeetingMinute(
  payload: ExitMeetingMinutePayload,
) {
  return requestJson<ExitMeetingMinuteMessageResponse>(
    "/api/backend/exit-meeting-minutes",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateExitMeetingMinute(
  id: number,
  payload: ExitMeetingMinuteUpdatePayload,
) {
  return requestJson<ExitMeetingMinuteMessageResponse>(
    `/api/backend/exit-meeting-minutes/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateExitMeetingMinute(
  id: number,
) {
  return requestJson<ExitMeetingMinuteMessageResponse>(
    `/api/backend/exit-meeting-minutes/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function restoreExitMeetingMinute(
  id: number,
) {
  return requestJson<ExitMeetingMinuteMessageResponse>(
    `/api/backend/exit-meeting-minutes/${id}/restore`,
    {
      method: "PATCH",
    },
  );
}

export async function permanentDeleteExitMeetingMinute(
  id: number,
) {
  return requestJson<ExitMeetingMinuteMessageResponse>(
    `/api/backend/exit-meeting-minutes/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}

export async function getExitMeetingMinuteReport(
  id: number,
) {
  return requestJson<ExitMeetingMinuteReport>(
    `/api/backend/exit-meeting-minutes/${id}/report`,
    {
      method: "GET",
    },
  );
}

export type ExitMeetingWorkflowStatus =
  | "draft"
  | "pending_lock_approval"
  | "locked"
  | "pending_unlock_approval"
  | "unlocked_for_edit"
  | "pending_relock_approval"
  | "changes_requested";

export type ExitMeetingUnlockRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed"
  | "expired";

export type ExitMeetingEditScope =
  | "minute_information"
  | "participants"
  | "visit_dates"
  | "findings"
  | "management_response"
  | "chairman"
  | "full_report";

export type ExitMeetingSnapshot = {
  snapshot_id: number;
  minute_id: number;
  snapshot_version: number;
  snapshot_kind: string;

  snapshot_data: Record<string, unknown>;
  snapshot_hash: string;

  template_key: string | null;
  template_version: string | null;

  source_unlock_request_id: number | null;

  locked_by_user_id: string | null;
  approved_by_user_id: string | null;
  locked_at: string;

  lock_reason: string | null;
  is_current: boolean;

  created_by: string | null;
  created_at: string;
};

export type ExitMeetingUnlockRequest = {
  request_id: number;
  minute_id: number;

  request_status: ExitMeetingUnlockRequestStatus;
  request_reason: string;
  edit_scope:
    | ExitMeetingEditScope[]
    | Record<string, unknown>;

  requested_by_user_id: string;
  requested_at: string;

  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  review_comment: string | null;

  approved_until: string | null;
  completed_at: string | null;
  cancelled_at: string | null;

  is_active: boolean;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExitMeetingWorkflowEvent = {
  event_id: number;
  minute_id: number;

  unlock_request_id: number | null;
  snapshot_id: number | null;

  event_type: string;
  from_status: string | null;
  to_status: string;

  event_comment: string | null;
  event_payload: Record<string, unknown> | null;

  performed_by_user_id: string | null;
  performed_at: string;
  created_at: string;
};

export type ExitMeetingSubmitForLockPayload = {
  submission_comment?: string | null;
};

export type ExitMeetingLockReviewPayload = {
  decision: "approve" | "request_changes";
  review_comment?: string | null;
};

export type ExitMeetingUnlockRequestPayload = {
  request_reason: string;
  edit_scope: ExitMeetingEditScope[];
};

export type ExitMeetingUnlockReviewPayload = {
  decision: "approve" | "reject";
  review_comment?: string | null;
  approved_until?: string | null;
};

export type ExitMeetingSubmitForRelockPayload = {
  submission_comment?: string | null;
};

export type ExitMeetingWorkflowActionResponse = {
  message: string;
  data: ExitMeetingMinute;
};

export type ExitMeetingUnlockActionResponse = {
  message: string;
  data: ExitMeetingUnlockRequest;
};

export type ExitMeetingSnapshotListResponse = {
  total: number;
  items: ExitMeetingSnapshot[];
};

export type ExitMeetingWorkflowEventListResponse = {
  total: number;
  items: ExitMeetingWorkflowEvent[];
};

export type ExitMeetingWorkflowSummary = {
  minute: ExitMeetingMinute;
  current_snapshot: ExitMeetingSnapshot | null;
  current_unlock_request: ExitMeetingUnlockRequest | null;
  recent_events: ExitMeetingWorkflowEvent[];
};

export type ExitMeetingLockReviewQueueResponse = {
  total: number;
  page: number;
  page_size: number;
  items: ExitMeetingMinute[];
};

export type ExitMeetingUnlockReviewQueueItem = {
  request: ExitMeetingUnlockRequest;
  minute: ExitMeetingMinute;
};

export type ExitMeetingUnlockReviewQueueResponse = {
  total: number;
  page: number;
  page_size: number;
  items: ExitMeetingUnlockReviewQueueItem[];
};

export type ExitMeetingLockQueueParams = {
  page: number;
  pageSize: number;
  search?: string;
  workflowStatus?: ExitMeetingWorkflowStatus;
};

export type ExitMeetingUnlockQueueParams = {
  page: number;
  pageSize: number;
  search?: string;
  requestStatus?: ExitMeetingUnlockRequestStatus;
};

const EXIT_MEETING_WORKFLOW_BASE_URL =
  "/api/backend/exit-meeting-workflow";

function buildLockReviewQueueQuery(
  params: ExitMeetingLockQueueParams,
) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.workflowStatus) {
    query.set(
      "workflow_status",
      params.workflowStatus,
    );
  }

  return query.toString();
}

function buildUnlockReviewQueueQuery(
  params: ExitMeetingUnlockQueueParams,
) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.requestStatus) {
    query.set(
      "request_status",
      params.requestStatus,
    );
  }

  return query.toString();
}

export async function listExitMeetingLockReviewQueue(
  params: ExitMeetingLockQueueParams,
) {
  const query = buildLockReviewQueueQuery(
    params,
  );

  return requestJson<ExitMeetingLockReviewQueueResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/lock-review-queue?${query}`,
    {
      method: "GET",
    },
  );
}

export async function listExitMeetingUnlockReviewQueue(
  params: ExitMeetingUnlockQueueParams,
) {
  const query = buildUnlockReviewQueueQuery(
    params,
  );

  return requestJson<ExitMeetingUnlockReviewQueueResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/unlock-review-queue?${query}`,
    {
      method: "GET",
    },
  );
}

export async function getExitMeetingWorkflowSummary(
  minuteId: number,
) {
  return requestJson<ExitMeetingWorkflowSummary>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/minutes/${minuteId}/summary`,
    {
      method: "GET",
    },
  );
}

export async function listExitMeetingSnapshots(
  minuteId: number,
) {
  return requestJson<ExitMeetingSnapshotListResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/minutes/${minuteId}/snapshots`,
    {
      method: "GET",
    },
  );
}

export async function listExitMeetingWorkflowEvents(
  minuteId: number,
  limit = 100,
) {
  const safeLimit = Math.max(
    1,
    Math.min(limit, 500),
  );

  return requestJson<ExitMeetingWorkflowEventListResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/minutes/${minuteId}/events?limit=${safeLimit}`,
    {
      method: "GET",
    },
  );
}

export async function getExitMeetingSnapshotReport(
  snapshotId: number,
) {
  return requestJson<ExitMeetingMinuteReport>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/snapshots/${snapshotId}/report`,
    {
      method: "GET",
    },
  );
}

export async function submitExitMeetingForLock(
  minuteId: number,
  payload: ExitMeetingSubmitForLockPayload = {},
) {
  return requestJson<ExitMeetingWorkflowActionResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/minutes/${minuteId}/submit-lock`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function reviewExitMeetingLock(
  minuteId: number,
  payload: ExitMeetingLockReviewPayload,
) {
  return requestJson<ExitMeetingWorkflowActionResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/minutes/${minuteId}/review-lock`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function requestExitMeetingUnlock(
  minuteId: number,
  payload: ExitMeetingUnlockRequestPayload,
) {
  return requestJson<ExitMeetingUnlockActionResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/minutes/${minuteId}/request-unlock`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function reviewExitMeetingUnlockRequest(
  requestId: number,
  payload: ExitMeetingUnlockReviewPayload,
) {
  return requestJson<ExitMeetingUnlockActionResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/unlock-requests/${requestId}/review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function submitExitMeetingForRelock(
  minuteId: number,
  payload: ExitMeetingSubmitForRelockPayload = {},
) {
  return requestJson<ExitMeetingWorkflowActionResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/minutes/${minuteId}/submit-relock`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function cancelExitMeetingUnlockRequest(
  requestId: number,
) {
  return requestJson<ExitMeetingUnlockActionResponse>(
    `${EXIT_MEETING_WORKFLOW_BASE_URL}/unlock-requests/${requestId}/cancel`,
    {
      method: "POST",
    },
  );
}

