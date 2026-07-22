"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileClock,
  History,
  KeyRound,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import CrudPagination from "@/components/crud/CrudPagination";
import {
  CrudPillBadge,
  CrudStatusBadge,
} from "@/components/crud/CrudStatusBadge";
import CrudToolbar, {
  type CrudToolbarFilter,
} from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import {
  getExitMeetingWorkflowSummary,
  listExitMeetingLockReviewQueue,
  listExitMeetingSnapshots,
  listExitMeetingUnlockReviewQueue,
  reviewExitMeetingLock,
  reviewExitMeetingUnlockRequest,
  type ExitMeetingMinute,
  type ExitMeetingSnapshot,
  type ExitMeetingUnlockRequest,
  type ExitMeetingUnlockRequestStatus,
  type ExitMeetingUnlockReviewQueueItem,
  type ExitMeetingWorkflowEvent,
  type ExitMeetingWorkflowStatus,
} from "@/services/meetingMinutes/exitMeetingMinute";
import { getCurrentUser, type CurrentUser } from "@/services/currentUser";

type QueueTab = "lock" | "unlock";

type LockQueueFilter =
  "all" | "pending_lock_approval" | "pending_relock_approval";

type ReviewDecision = "approve" | "request_changes" | "reject";

type ReviewTarget =
  | {
      kind: "lock";
      minute: ExitMeetingMinute;
    }
  | {
      kind: "unlock";
      item: ExitMeetingUnlockReviewQueueItem;
    }
  | null;

type PageMessage = {
  type: "success" | "error";
  text: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toTitle(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildDefaultApprovedUntil() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function normalizeEditScope(
  value: string[] | Record<string, unknown> | null | undefined,
) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  const possibleValues = [value.edit_scope, value.scopes, value.fields];

  for (const possibleValue of possibleValues) {
    if (Array.isArray(possibleValue)) {
      return possibleValue.filter(
        (item): item is string => typeof item === "string",
      );
    }
  }

  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => key);
}

export default function ExitMeetingApprovalsPage() {
  const approvalActions = useModuleActions("exit_meeting_minute_approvals");

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [activeTab, setActiveTab] = useState<QueueTab>("lock");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(
    DEFAULT_CRUD_PAGE_SIZE,
  );

  const [lockWorkflowFilter, setLockWorkflowFilter] =
    useState<LockQueueFilter>("all");

  const [unlockRequestStatus, setUnlockRequestStatus] =
    useState<ExitMeetingUnlockRequestStatus>("pending");

  const [lockItems, setLockItems] = useState<ExitMeetingMinute[]>([]);

  const [unlockItems, setUnlockItems] = useState<
    ExitMeetingUnlockReviewQueueItem[]
  >([]);

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState<PageMessage | null>(null);

  const [reviewTarget, setReviewTarget] = useState<ReviewTarget>(null);

  const [reviewDecision, setReviewDecision] =
    useState<ReviewDecision>("approve");

  const [reviewComment, setReviewComment] = useState("");

  const [approvedUntil, setApprovedUntil] = useState(
    buildDefaultApprovedUntil(),
  );

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [historyMinute, setHistoryMinute] = useState<ExitMeetingMinute | null>(
    null,
  );

  const [historySnapshots, setHistorySnapshots] = useState<
    ExitMeetingSnapshot[]
  >([]);

  const [historyEvents, setHistoryEvents] = useState<
    ExitMeetingWorkflowEvent[]
  >([]);

  const [historyUnlockRequest, setHistoryUnlockRequest] =
    useState<ExitMeetingUnlockRequest | null>(null);

  const [historyLoading, setHistoryLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = useMemo(() => {
    if (pageSize === "all") {
      return 100;
    }

    return Number(pageSize);
  }, [pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize === "all") {
      return 1;
    }

    return Math.max(Math.ceil(total / numericPageSize), 1);
  }, [numericPageSize, pageSize, total]);

  const canReviewActiveQueue =
    activeTab === "lock"
      ? approvalActions.canApprove
      : approvalActions.canReviewUnlock;

  const toolbarFilters = useMemo<CrudToolbarFilter[]>(() => {
    const filters: CrudToolbarFilter[] = [
      {
        key: "search",
        label: "Search",
        type: "search",
        value: search,
        placeholder: "Search meeting, client or requester...",
        onChange: (value) => {
          setSearch(value);
          setPage(1);
        },
      },
    ];

    if (activeTab === "lock") {
      filters.push({
        key: "workflow_status",
        label: "Submission Type",
        type: "select",
        value: lockWorkflowFilter,
        options: [
          {
            value: "all",
            label: "All Pending",
          },
          {
            value: "pending_lock_approval",
            label: "Initial Lock",
          },
          {
            value: "pending_relock_approval",
            label: "Relock",
          },
        ],
        onChange: (value) => {
          setLockWorkflowFilter(value as LockQueueFilter);
          setPage(1);
        },
      });
    } else {
      filters.push({
        key: "request_status",
        label: "Request Status",
        type: "select",
        value: unlockRequestStatus,
        options: [
          {
            value: "pending",
            label: "Pending",
          },
          {
            value: "approved",
            label: "Approved",
          },
          {
            value: "rejected",
            label: "Rejected",
          },
          {
            value: "cancelled",
            label: "Cancelled",
          },
          {
            value: "completed",
            label: "Completed",
          },
          {
            value: "expired",
            label: "Expired",
          },
        ],
        onChange: (value) => {
          setUnlockRequestStatus(value as ExitMeetingUnlockRequestStatus);
          setPage(1);
        },
      });
    }

    return filters;
  }, [activeTab, lockWorkflowFilter, search, unlockRequestStatus]);

  const loadQueue = useCallback(async () => {
    if (!canReviewActiveQueue) {
      setLockItems([]);
      setUnlockItems([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      if (activeTab === "lock") {
        const response = await listExitMeetingLockReviewQueue({
          page,
          pageSize: numericPageSize,
          search: debouncedSearch.trim() || undefined,
          workflowStatus:
            lockWorkflowFilter === "all"
              ? undefined
              : (lockWorkflowFilter as ExitMeetingWorkflowStatus),
        });

        setLockItems(response.items);
        setUnlockItems([]);
        setTotal(response.total);
      } else {
        const response = await listExitMeetingUnlockReviewQueue({
          page,
          pageSize: numericPageSize,
          search: debouncedSearch.trim() || undefined,
          requestStatus: unlockRequestStatus,
        });

        setUnlockItems(response.items);
        setLockItems([]);
        setTotal(response.total);
      }
    } catch (error) {
      setLockItems([]);
      setUnlockItems([]);
      setTotal(0);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load approval queue.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTab,
    canReviewActiveQueue,
    debouncedSearch,
    lockWorkflowFilter,
    numericPageSize,
    page,
    unlockRequestStatus,
  ]);

  useEffect(() => {
    let mounted = true;

    void getCurrentUser()
      .then((user) => {
        if (mounted) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (mounted) {
          setCurrentUser(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadQueue();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadQueue]);

  const changeTab = (tab: QueueTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setMessage(null);
  };

  const openLockReview = (minute: ExitMeetingMinute) => {
    setReviewTarget({
      kind: "lock",
      minute,
    });
    setReviewDecision("approve");
    setReviewComment("");
    setApprovedUntil(buildDefaultApprovedUntil());
    setReviewError(null);
  };

  const openUnlockReview = (item: ExitMeetingUnlockReviewQueueItem) => {
    setReviewTarget({
      kind: "unlock",
      item,
    });
    setReviewDecision("approve");
    setReviewComment("");
    setApprovedUntil(buildDefaultApprovedUntil());
    setReviewError(null);
  };

  const closeReviewModal = () => {
    if (reviewLoading) return;

    setReviewTarget(null);
    setReviewDecision("approve");
    setReviewComment("");
    setApprovedUntil(buildDefaultApprovedUntil());
    setReviewError(null);
  };

  const handleReview = async () => {
    if (!reviewTarget) return;

    if (reviewTarget.kind === "lock" && !approvalActions.canApprove) {
      setReviewError(
        "You do not have permission to review lock submissions.",
      );
      return;
    }

    if (reviewTarget.kind === "unlock" && !approvalActions.canReviewUnlock) {
      setReviewError(
        "You do not have permission to review unlock requests.",
      );
      return;
    }

    const trimmedComment = reviewComment.trim();

    if (reviewDecision === "request_changes" && trimmedComment.length < 5) {
      setReviewError(
        "A clear review comment is required when requesting changes.",
      );
      return;
    }

    if (reviewDecision === "reject" && trimmedComment.length < 5) {
      setReviewError("A rejection reason is required.");
      return;
    }

    if (
      reviewTarget.kind === "unlock" &&
      reviewDecision === "approve" &&
      !approvedUntil
    ) {
      setReviewError(
        "Approved edit expiry date and time is required.",
      );
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      let response: { message: string };

      if (reviewTarget.kind === "lock") {
        response = await reviewExitMeetingLock(reviewTarget.minute.minute_id, {
          decision:
            reviewDecision === "request_changes"
              ? "request_changes"
              : "approve",
          review_comment: trimmedComment || null,
        });
      } else {
        response = await reviewExitMeetingUnlockRequest(
          reviewTarget.item.request.request_id,
          {
            decision: reviewDecision === "reject" ? "reject" : "approve",
            review_comment: trimmedComment || null,
            approved_until:
              reviewDecision === "approve"
                ? new Date(approvedUntil).toISOString()
                : null,
          },
        );
      }

      closeReviewModal();
      await loadQueue();

      setMessage({
        type: "success",
        text: response.message,
      });
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Review action failed.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const openHistory = async (minute: ExitMeetingMinute) => {
    setHistoryMinute(minute);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistorySnapshots([]);
    setHistoryEvents([]);
    setHistoryUnlockRequest(null);

    try {
      const [summary, snapshotResponse] = await Promise.all([
        getExitMeetingWorkflowSummary(minute.minute_id),
        listExitMeetingSnapshots(minute.minute_id),
      ]);

      setHistorySnapshots(snapshotResponse.items);
      setHistoryEvents(summary.recent_events);
      setHistoryUnlockRequest(summary.current_unlock_request);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load workflow history.",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    if (historyLoading) return;

    setHistoryOpen(false);
    setHistoryMinute(null);
    setHistorySnapshots([]);
    setHistoryEvents([]);
    setHistoryUnlockRequest(null);
  };

  const resetFilters = () => {
    setSearch("");
    setPage(1);
    setPageSize(DEFAULT_CRUD_PAGE_SIZE);

    if (activeTab === "lock") {
      setLockWorkflowFilter("all");
    } else {
      setUnlockRequestStatus("pending");
    }
  };

  const reviewMinute =
    reviewTarget?.kind === "lock"
      ? reviewTarget.minute
      : reviewTarget?.kind === "unlock"
        ? reviewTarget.item.minute
        : null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-950 to-emerald-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">
                Maker–Checker Control
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Exit Meeting Approvals
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Review initial locks, relocks and controlled unlock requests
                before immutable reports are finalized.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-200">
                Current Checker
              </p>

              <p className="mt-1 text-sm font-black text-white">
                {currentUser?.full_name ||
                  currentUser?.user_id ||
                  "Authenticated User"}
              </p>

              <p className="mt-1 text-xs text-slate-300">
                {currentUser?.user_id || "-"}
                {currentUser?.email ? ` · ${currentUser.email}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50 px-5 pt-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => changeTab("lock")}
              className={
                activeTab === "lock"
                  ? "inline-flex items-center gap-2 rounded-t-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-sm"
                  : "inline-flex items-center gap-2 rounded-t-2xl px-5 py-3 text-sm font-black text-slate-500 transition hover:bg-white/70"
              }
            >
              <ShieldCheck size={18} />
              Lock / Relock Queue
            </button>

            <button
              type="button"
              onClick={() => changeTab("unlock")}
              className={
                activeTab === "unlock"
                  ? "inline-flex items-center gap-2 rounded-t-2xl bg-white px-5 py-3 text-sm font-black text-amber-700 shadow-sm"
                  : "inline-flex items-center gap-2 rounded-t-2xl px-5 py-3 text-sm font-black text-slate-500 transition hover:bg-white/70"
              }
            >
              <KeyRound size={18} />
              Unlock Request Queue
            </button>
          </div>
        </div>

        <CrudToolbar
          pageSize={pageSize}
          filters={toolbarFilters}
          onPageSizeChange={(value) => {
            setPageSize(value as CrudPageSizeOption);
            setPage(1);
          }}
          onRefresh={loadQueue}
          onReset={resetFilters}
        />

        {message ? (
          <div
            className={`border-b px-5 py-3 text-sm font-bold ${
              message.type === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {!canReviewActiveQueue ? (
          <div className="p-10 text-center">
            <ShieldCheck size={44} className="mx-auto text-slate-300" />

            <p className="mt-3 text-base font-black text-slate-700">
              Review permission is not assigned
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Your role cannot review this approval queue.
            </p>
          </div>
        ) : null}

        {canReviewActiveQueue && activeTab === "lock" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Minute</th>
                  <th className="px-5 py-4">Meeting / Client</th>
                  <th className="px-5 py-4">Workflow</th>
                  <th className="px-5 py-4">Maker</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Snapshot</th>
                  <th className="px-5 py-4">Active</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14">
                      <div className="flex items-center justify-center gap-3 text-slate-500">
                        <Loader2 size={22} className="animate-spin" />
                        Loading approval queue...
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!isLoading && lockItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <CheckCircle2
                        size={44}
                        className="mx-auto text-emerald-300"
                      />

                      <p className="mt-3 text-sm font-black text-slate-600">
                        No lock or relock submissions are waiting
                      </p>
                    </td>
                  </tr>
                ) : null}

                {!isLoading
                  ? lockItems.map((minute) => (
                      <tr key={minute.minute_id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">
                            #{minute.minute_id}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Audit #{minute.audit_id || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-xs font-bold text-slate-800">
                            {minute.meeting_name ||
                              `Meeting #${minute.meeting_id}`}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {minute.client_name || minute.client_code || "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(minute.meeting_date)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <CrudPillBadge>
                            {toTitle(minute.workflow_status)}
                          </CrudPillBadge>

                          <p className="mt-2 text-xs font-bold text-slate-400">
                            Workflow v{minute.workflow_version}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-700">
                            {minute.submitted_by_user_id || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDateTime(minute.submitted_at)}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-slate-700">
                            v{minute.snapshot_version || 0}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {minute.is_locked
                              ? "Currently locked"
                              : "Draft state"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <CrudStatusBadge active={minute.is_active} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/audit-meetings/minutes/exit/${minute.minute_id}/report`}
                              title="View Report"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye size={16} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => void openHistory(minute)}
                              title="Workflow History"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
                            >
                              <History size={16} />
                            </button>

                            {approvalActions.canApprove ? (
                              <button
                                type="button"
                                onClick={() => openLockReview(minute)}
                                title="Review Submission"
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-800"
                              >
                                <ShieldCheck size={15} />
                                Review
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {canReviewActiveQueue && activeTab === "unlock" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Request</th>
                  <th className="px-5 py-4">Meeting / Client</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Edit Scope</th>
                  <th className="px-5 py-4">Requester</th>
                  <th className="px-5 py-4">Requested</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14">
                      <div className="flex items-center justify-center gap-3 text-slate-500">
                        <Loader2 size={22} className="animate-spin" />
                        Loading unlock requests...
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!isLoading && unlockItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <KeyRound size={44} className="mx-auto text-amber-300" />

                      <p className="mt-3 text-sm font-black text-slate-600">
                        No unlock requests found
                      </p>
                    </td>
                  </tr>
                ) : null}

                {!isLoading
                  ? unlockItems.map((item) => {
                      const scopes = normalizeEditScope(
                        item.request.edit_scope,
                      );

                      return (
                        <tr
                          key={item.request.request_id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-black text-slate-900">
                              #{item.request.request_id}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              Minute #{item.minute.minute_id}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-xs font-bold text-slate-800">
                              {item.minute.meeting_name ||
                                `Meeting #${item.minute.meeting_id}`}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {item.minute.client_name ||
                                item.minute.client_code ||
                                "-"}
                            </p>
                          </td>

                          <td className="max-w-sm px-5 py-4 text-sm text-slate-600">
                            {item.request.request_reason}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex max-w-sm flex-wrap gap-1.5">
                              {scopes.length > 0 ? (
                                scopes.map((scope) => (
                                  <CrudPillBadge key={scope}>
                                    {toTitle(scope)}
                                  </CrudPillBadge>
                                ))
                              ) : (
                                <span className="text-sm text-slate-400">
                                  -
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-700">
                              {item.request.requested_by_user_id}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDateTime(item.request.requested_at)}
                          </td>

                          <td className="px-5 py-4">
                            <CrudPillBadge>
                              {toTitle(item.request.request_status)}
                            </CrudPillBadge>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/audit-meetings/minutes/exit/${item.minute.minute_id}/report`}
                                title="View Report"
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={16} />
                              </Link>

                              <button
                                type="button"
                                onClick={() => void openHistory(item.minute)}
                                title="Workflow History"
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
                              >
                                <History size={16} />
                              </button>

                              {item.request.request_status === "pending" &&
                              approvalActions.canReviewUnlock ? (
                                <button
                                  type="button"
                                  onClick={() => openUnlockReview(item)}
                                  title="Review Unlock Request"
                                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white transition hover:bg-amber-700"
                                >
                                  <KeyRound size={15} />
                                  Review
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {canReviewActiveQueue ? (
          <CrudPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={numericPageSize}
            onPageChange={setPage}
          />
        ) : null}
      </section>

      {historyOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Snapshot and Workflow History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Minute #{historyMinute?.minute_id || "-"} ·{" "}
                  {historyMinute?.meeting_name || "Exit Meeting"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeHistory}
                disabled={historyLoading}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-7 p-6">
              {historyLoading ? (
                <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
                  <Loader2 size={24} className="animate-spin" />
                  Loading history...
                </div>
              ) : (
                <>
                  {historyUnlockRequest ? (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                        Current Unlock Request
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {historyUnlockRequest.request_reason}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Requested by {historyUnlockRequest.requested_by_user_id}{" "}
                        · {formatDateTime(historyUnlockRequest.requested_at)}
                      </p>
                    </section>
                  ) : null}

                  <section>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">
                        Immutable Snapshots
                      </h3>

                      <span className="text-xs font-bold text-slate-400">
                        {historySnapshots.length} version(s)
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {historySnapshots.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-7 text-center text-sm font-semibold text-slate-400">
                          No immutable snapshot has been created.
                        </div>
                      ) : (
                        historySnapshots.map((snapshot) => (
                          <article
                            key={snapshot.snapshot_id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-black text-slate-900">
                                  Snapshot v{snapshot.snapshot_version}
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                  {toTitle(snapshot.snapshot_kind)} ·{" "}
                                  {formatDateTime(snapshot.locked_at)}
                                </p>
                              </div>

                              <CrudPillBadge>
                                {snapshot.is_current ? "Current" : "Historical"}
                              </CrudPillBadge>
                            </div>

                            <p className="mt-3 break-all text-xs text-slate-500">
                              SHA-256: {snapshot.snapshot_hash}
                            </p>

                            <p className="mt-2 text-xs font-semibold text-slate-400">
                              Approved by: {snapshot.approved_by_user_id || "-"}
                            </p>
                          </article>
                        ))
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">
                        Workflow Timeline
                      </h3>

                      <span className="text-xs font-bold text-slate-400">
                        {historyEvents.length} event(s)
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {historyEvents.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-7 text-center text-sm font-semibold text-slate-400">
                          No workflow event has been recorded.
                        </div>
                      ) : (
                        historyEvents.map((event) => (
                          <article
                            key={event.event_id}
                            className="rounded-2xl border border-slate-200 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-black text-slate-900">
                                  {toTitle(event.event_type)}
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                  {toTitle(event.from_status)} →{" "}
                                  {toTitle(event.to_status)}
                                </p>
                              </div>

                              <p className="text-xs font-bold text-slate-400">
                                {formatDateTime(event.performed_at)}
                              </p>
                            </div>

                            {event.event_comment ? (
                              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                                {event.event_comment}
                              </p>
                            ) : null}

                            <p className="mt-2 text-xs font-semibold text-slate-400">
                              Actor: {event.performed_by_user_id || "System"}
                            </p>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {reviewTarget && reviewMinute ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className={
                  reviewTarget.kind === "lock"
                    ? "rounded-2xl bg-emerald-50 p-3 text-emerald-700"
                    : "rounded-2xl bg-amber-50 p-3 text-amber-700"
                }
              >
                {reviewTarget.kind === "lock" ? (
                  <ShieldCheck size={26} />
                ) : (
                  <KeyRound size={26} />
                )}
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {reviewTarget.kind === "lock"
                    ? "Review Lock / Relock Submission"
                    : "Review Unlock Request"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Minute #{reviewMinute.minute_id} ·{" "}
                  {reviewMinute.meeting_name ||
                    `Meeting #${reviewMinute.meeting_id}`}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Maker
                </p>

                <p className="mt-1 font-bold text-slate-700">
                  {reviewTarget.kind === "lock"
                    ? reviewMinute.submitted_by_user_id || "-"
                    : reviewTarget.item.request.requested_by_user_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Checker
                </p>

                <p className="mt-1 font-bold text-slate-700">
                  {currentUser?.full_name || currentUser?.user_id || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Workflow
                </p>

                <p className="mt-1 font-bold text-slate-700">
                  {toTitle(reviewMinute.workflow_status)}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Current Snapshot
                </p>

                <p className="mt-1 font-bold text-slate-700">
                  Version {reviewMinute.snapshot_version || 0}
                </p>
              </div>
            </div>

            {reviewTarget.kind === "unlock" ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                  Unlock Reason
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {reviewTarget.item.request.request_reason}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {normalizeEditScope(reviewTarget.item.request.edit_scope).map(
                    (scope) => (
                      <CrudPillBadge key={scope}>
                        {toTitle(scope)}
                      </CrudPillBadge>
                    ),
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <p className="text-sm font-black text-slate-700">Decision</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-800">
                  <input
                    type="radio"
                    name="review-decision"
                    value="approve"
                    checked={reviewDecision === "approve"}
                    onChange={() => setReviewDecision("approve")}
                    className="h-4 w-4"
                  />
                  <CheckCircle2 size={18} />
                  Approve
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-800">
                  <input
                    type="radio"
                    name="review-decision"
                    value={
                      reviewTarget.kind === "lock"
                        ? "request_changes"
                        : "reject"
                    }
                    checked={
                      reviewTarget.kind === "lock"
                        ? reviewDecision === "request_changes"
                        : reviewDecision === "reject"
                    }
                    onChange={() =>
                      setReviewDecision(
                        reviewTarget.kind === "lock"
                          ? "request_changes"
                          : "reject",
                      )
                    }
                    className="h-4 w-4"
                  />

                  <XCircle size={18} />

                  {reviewTarget.kind === "lock" ? "Request Changes" : "Reject"}
                </label>
              </div>
            </div>

            {reviewTarget.kind === "unlock" && reviewDecision === "approve" ? (
              <div className="mt-5">
                <label className="text-sm font-black text-slate-700">
                  Edit Access Expires
                </label>

                <div className="relative mt-2">
                  <Clock3 className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                  <input
                    type="datetime-local"
                    value={approvedUntil}
                    onChange={(event) => setApprovedUntil(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  The maker must complete editing and submit for relock before
                  this time.
                </p>
              </div>
            ) : null}

            <div className="mt-5">
              <label className="text-sm font-black text-slate-700">
                Checker Comment
              </label>

              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                rows={4}
                placeholder={
                  reviewDecision === "request_changes" ||
                  reviewDecision === "reject"
                    ? "Explain the required changes or rejection reason..."
                    : "Optional approval comment..."
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {reviewError ? (
              <div
                role="alert"
                className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{reviewError}</span>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <div className="flex gap-2">
                <Link
                  href={`/audit-meetings/minutes/exit/${reviewMinute.minute_id}/report`}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <FileClock size={17} />
                  View Report
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    closeReviewModal();
                    void openHistory(reviewMinute);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <History size={17} />
                  History
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={reviewLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReview}
                  disabled={reviewLoading}
                  className={
                    reviewDecision === "request_changes" ||
                    reviewDecision === "reject"
                      ? "inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-rose-800 disabled:opacity-60"
                      : "inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-60"
                  }
                >
                  {reviewLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : reviewDecision === "request_changes" ||
                    reviewDecision === "reject" ? (
                    <XCircle size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  Confirm Review
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
