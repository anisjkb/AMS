"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  Eye,
  FileText,
  History,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import {
  CrudPillBadge,
  CrudStatusBadge,
} from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import {
  listMeetingMaster,
  type MeetingMaster,
} from "@/services/meetingMaster";
import {
  listMeetingParticipants,
  type MeetingParticipant,
} from "@/services/meetingParticipant";
import {
  cancelExitMeetingUnlockRequest,
  createExitMeetingMinute,
  deactivateExitMeetingMinute,
  getExitMeetingWorkflowSummary,
  listExitMeetingMinutes,
  listExitMeetingSnapshots,
  permanentDeleteExitMeetingMinute,
  requestExitMeetingUnlock,
  restoreExitMeetingMinute,
  submitExitMeetingForLock,
  submitExitMeetingForRelock,
  updateExitMeetingMinute,
  type ExitMeetingEditScope,
  type ExitMeetingMinute,
  type ExitMeetingMinutePayload,
  type ExitMeetingMinuteUpdatePayload,
  type ExitMeetingSnapshot,
  type ExitMeetingUnlockRequest,
  type ExitMeetingWorkflowEvent,
} from "@/services/meetingMinutes/exitMeetingMinute";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type SaveMode = "add_another" | "close";

type WorkflowAction =
  | "submit_lock"
  | "request_unlock"
  | "cancel_unlock"
  | "submit_relock";

type WorkflowModalState = {
  item: ExitMeetingMinute;
  action: WorkflowAction;
} | null;

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  meeting_id: string;
  chairman_participant_id: string;
  status: string;
};

const emptyForm: FormState = {
  meeting_id: "",
  chairman_participant_id: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "closed", label: "Closed" },
  { value: "inactive", label: "Inactive" },
];

const confirmActionLabel: Record<ConfirmAction, string> = {
  inactive: "Inactive",
  restore: "Restore",
  permanent_delete: "Permanent Delete",
};

const workflowActionLabel: Record<WorkflowAction, string> = {
  submit_lock: "Submit for Lock Approval",
  request_unlock: "Request Unlock",
  cancel_unlock: "Cancel Unlock Request",
  submit_relock: "Submit for Relock Approval",
};

const editScopeOptions: {
  value: ExitMeetingEditScope;
  label: string;
}[] = [
  {
    value: "minute_information",
    label: "Minute Information",
  },
  {
    value: "participants",
    label: "Participants",
  },
  {
    value: "visit_dates",
    label: "Visit Dates",
  },
  {
    value: "findings",
    label: "Findings",
  },
  {
    value: "management_response",
    label: "Management Response",
  },
  {
    value: "chairman",
    label: "Chairman",
  },
  {
    value: "full_report",
    label: "Full Report",
  },
];

function isWorkflowEditable(
  item: ExitMeetingMinute,
) {
  return (
    item.is_active &&
    [
      "draft",
      "changes_requested",
      "unlocked_for_edit",
    ].includes(item.workflow_status)
  );
}

function isLifecycleAllowed(
  item: ExitMeetingMinute,
) {
  return [
    "draft",
    "changes_requested",
  ].includes(item.workflow_status);
}

function isEditScopeAllowed(
  item: ExitMeetingMinute,
  requiredScope: ExitMeetingEditScope,
) {
  if (
    item.workflow_status !==
    "unlocked_for_edit"
  ) {
    return true;
  }

  const scopes =
    item.current_edit_scope ?? [];

  return (
    scopes.includes("full_report") ||
    scopes.includes(requiredScope)
  );
}

function buildUpdatePayload(
  form: FormState,
  item: ExitMeetingMinute,
): ExitMeetingMinuteUpdatePayload {
  const payload: ExitMeetingMinuteUpdatePayload =
    {};

  if (
    isEditScopeAllowed(
      item,
      "minute_information",
    )
  ) {
    const meetingId = Number.parseInt(
      form.meeting_id,
      10,
    );

    if (meetingId !== item.meeting_id) {
      payload.meeting_id = meetingId;
    }

    const nextStatus = form.status.trim();

    if (nextStatus !== item.status) {
      payload.status = nextStatus;
    }
  }

  if (
    isEditScopeAllowed(
      item,
      "chairman",
    )
  ) {
    const chairmanParticipantId =
      Number.parseInt(
        form.chairman_participant_id,
        10,
      );

    if (
      chairmanParticipantId !==
      item.chairman_participant_id
    ) {
      payload.chairman_participant_id =
        chairmanParticipantId;
    }
  }

  return payload;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(
  value: string | null | undefined,
) {
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

function buildMeetingLabel(meeting: MeetingMaster) {
  return [
    `#${meeting.meeting_id}`,
    meeting.meeting_name,
    meeting.meeting_type,
    meeting.client_code,
  ]
    .filter(Boolean)
    .join(" — ");
}

function buildChairmanLabel(participant: MeetingParticipant) {
  return [
    participant.participant_name ||
      `Participant #${participant.participant_id}`,
    participant.designation,
    participant.source_label,
  ]
    .filter(Boolean)
    .join(" — ");
}

function buildFormFromItem(item: ExitMeetingMinute): FormState {
  return {
    meeting_id: String(item.meeting_id),
    chairman_participant_id: String(item.chairman_participant_id),
    status: item.status,
  };
}

function buildPayload(form: FormState): ExitMeetingMinutePayload {
  return {
    meeting_id: Number.parseInt(form.meeting_id, 10),
    chairman_participant_id: Number.parseInt(form.chairman_participant_id, 10),
    status: form.status.trim(),
  };
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm font-bold text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}

export default function ExitMeetingMinutesPage() {
  const minuteActions = useModuleActions("exit_meeting_minutes");

  const [items, setItems] = useState<ExitMeetingMinute[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(
    DEFAULT_CRUD_PAGE_SIZE,
  );
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [meetingOptions, setMeetingOptions] = useState<MeetingMaster[]>([]);
  const [participantOptions, setParticipantOptions] = useState<
    MeetingParticipant[]
  >([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [participantLoading, setParticipantLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);
  const [saveMode, setSaveMode] = useState<SaveMode>("close");
  const [sessionCreatedCount, setSessionCreatedCount] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<ExitMeetingMinute | null>(
    null,
  );
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<ExitMeetingMinute | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const [workflowModal, setWorkflowModal] =
    useState<WorkflowModalState>(null);
  const [workflowComment, setWorkflowComment] =
    useState("");
  const [unlockReason, setUnlockReason] =
    useState("");
  const [unlockScopes, setUnlockScopes] =
    useState<ExitMeetingEditScope[]>([]);
  const [workflowLoading, setWorkflowLoading] =
    useState(false);

  const [historyOpen, setHistoryOpen] =
    useState(false);
  const [historyItem, setHistoryItem] =
    useState<ExitMeetingMinute | null>(null);
  const [historySnapshots, setHistorySnapshots] =
    useState<ExitMeetingSnapshot[]>([]);
  const [historyEvents, setHistoryEvents] =
    useState<ExitMeetingWorkflowEvent[]>([]);
  const [
    historyUnlockRequest,
    setHistoryUnlockRequest,
  ] = useState<ExitMeetingUnlockRequest | null>(
    null,
  );
  const [historyLoading, setHistoryLoading] =
    useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);
  const formRef = useRef<HTMLFormElement | null>(null);

  const numericPageSize = useMemo(() => {
    if (pageSize === "all") {
      return Math.max(Math.min(total || 100, 100), 1);
    }

    return Number(pageSize);
  }, [pageSize, total]);

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;

    return Math.max(Math.ceil(total / numericPageSize), 1);
  }, [numericPageSize, pageSize, total]);

  const isActiveFilter = useMemo(() => {
    if (statusFilter === "all") return undefined;

    return statusFilter === "active";
  }, [statusFilter]);

  const selectedMeeting = useMemo(() => {
    return meetingOptions.find(
      (meeting) => String(meeting.meeting_id) === form.meeting_id,
    );
  }, [form.meeting_id, meetingOptions]);

  const filteredChairmanOptions = useMemo(() => {
    if (!form.meeting_id) return [];

    return participantOptions.filter(
      (participant) =>
        String(participant.meeting_id) === form.meeting_id &&
        participant.is_active,
    );
  }, [form.meeting_id, participantOptions]);

  const showTopActions = minuteActions.showTopActions;
  const showRowActions =
    minuteActions.canView ||
    minuteActions.showRowActions;
  const tableColumnCount = showRowActions ? 11 : 10;

  const loadExitMeetingMinutes = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listExitMeetingMinutes({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch,
        isActive: isActiveFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load Exit Meeting Minutes records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadMeetingOptions = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const response = await listMeetingMaster({
        page: 1,
        pageSize: 100,
        isActive: true,
      });

      setMeetingOptions(response.items);
    } catch {
      setMeetingOptions([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadParticipantsForMeeting = useCallback(
    async (meetingId: string) => {
      if (!meetingId) {
        setParticipantOptions([]);
        return;
      }

      const meeting = meetingOptions.find(
        (item) => String(item.meeting_id) === meetingId,
      );

      setParticipantLoading(true);

      try {
        const response = await listMeetingParticipants({
          page: 1,
          pageSize: 100,
          search: meeting?.meeting_name || undefined,
          isActive: true,
        });

        setParticipantOptions(
          response.items.filter(
            (item) => String(item.meeting_id) === meetingId,
          ),
        );
      } catch {
        setParticipantOptions([]);
      } finally {
        setParticipantLoading(false);
      }
    },
    [meetingOptions],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadExitMeetingMinutes();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadExitMeetingMinutes]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMeetingOptions();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadMeetingOptions]);

  useEffect(() => {
    if (!drawerOpen) return;

    const timerId = window.setTimeout(() => {
      void loadParticipantsForMeeting(form.meeting_id);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [drawerOpen, form.meeting_id, loadParticipantsForMeeting]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const focusChairmanField = () => {
    window.setTimeout(() => {
      const selects =
        formRef.current?.querySelectorAll<HTMLSelectElement>("select");
      const chairmanSelect = selects?.[1];

      chairmanSelect?.focus();
    }, 80);
  };

  const openCreateDrawer = () => {
    const firstMeeting = meetingOptions[0];

    setDrawerMode("create");
    setSaveMode("close");
    setSessionCreatedCount(0);
    setSelectedItem(null);
    setForm({
      ...emptyForm,
      meeting_id: firstMeeting ? String(firstMeeting.meeting_id) : "",
    });
    setDrawerOpen(true);
    void loadMeetingOptions();
    focusChairmanField();
  };

  const openEditDrawer = (item: ExitMeetingMinute) => {
    if (!isWorkflowEditable(item)) {
      setMessage({
        type: "error",
        text:
          "This record cannot be edited in its current workflow state.",
      });
      return;
    }

    setDrawerMode("edit");
    setSaveMode("close");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
    void loadMeetingOptions();
    focusChairmanField();
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
    setParticipantOptions([]);
  };

  const openConfirm = (item: ExitMeetingMinute, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.meeting_id.trim()) {
      setMessage({ type: "error", text: "Meeting Master is required." });
      return false;
    }

    if (!form.chairman_participant_id.trim()) {
      setMessage({
        type: "error",
        text: "Chairman of Meeting is required.",
      });
      return false;
    }

    if (!form.status.trim()) {
      setMessage({ type: "error", text: "Status is required." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitLoading(true);
    setMessage(null);

    try {
      if (drawerMode === "create") {
        await createExitMeetingMinute(buildPayload(form));
        await loadExitMeetingMinutes();

        setSessionCreatedCount((current) => current + 1);

        if (saveMode === "add_another") {
          setForm((current) => ({
            ...emptyForm,
            meeting_id: current.meeting_id,
            chairman_participant_id: "",
            status: current.status || "active",
          }));

          setMessage({
            type: "success",
            text: "Exit Meeting Minutes record saved. Add another below.",
          });

          focusChairmanField();

          return;
        }

        setDrawerOpen(false);
        setSelectedItem(null);
        setForm(emptyForm);
        setParticipantOptions([]);

        setMessage({
          type: "success",
          text: "Exit Meeting Minutes record created successfully.",
        });

        return;
      }

      if (selectedItem) {
        const updatePayload =
          buildUpdatePayload(
            form,
            selectedItem,
          );

        if (
          Object.keys(updatePayload).length === 0
        ) {
          setMessage({
            type: "error",
            text:
              "No permitted changes were detected.",
          });
          return;
        }

        await updateExitMeetingMinute(
          selectedItem.minute_id,
          updatePayload,
        );
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);
      setParticipantOptions([]);

      await loadExitMeetingMinutes();

      setMessage({
        type: "success",
        text: "Exit Meeting Minutes record updated successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Exit Meeting Minutes request failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmItem || !confirmAction) return;

    setSubmitLoading(true);
    setMessage(null);

    try {
      if (confirmAction === "inactive") {
        await deactivateExitMeetingMinute(confirmItem.minute_id);
        setMessage({
          type: "success",
          text: "Exit Meeting Minutes record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreExitMeetingMinute(confirmItem.minute_id);
        setMessage({
          type: "success",
          text: "Exit Meeting Minutes record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteExitMeetingMinute(confirmItem.minute_id);
        setMessage({
          type: "success",
          text: "Exit Meeting Minutes record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadExitMeetingMinutes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const openWorkflowModal = (
    item: ExitMeetingMinute,
    action: WorkflowAction,
  ) => {
    setWorkflowModal({
      item,
      action,
    });
    setWorkflowComment("");
    setUnlockReason("");
    setUnlockScopes([]);
  };

  const closeWorkflowModal = () => {
    if (workflowLoading) return;

    setWorkflowModal(null);
    setWorkflowComment("");
    setUnlockReason("");
    setUnlockScopes([]);
  };

  const toggleUnlockScope = (
    scope: ExitMeetingEditScope,
  ) => {
    setUnlockScopes((current) => {
      if (current.includes(scope)) {
        return current.filter(
          (item) => item !== scope,
        );
      }

      if (scope === "full_report") {
        return ["full_report"];
      }

      return [
        ...current.filter(
          (item) => item !== "full_report",
        ),
        scope,
      ];
    });
  };

  const handleWorkflowAction = async () => {
    if (!workflowModal) return;

    const { item, action } = workflowModal;

    if (
      action === "request_unlock" &&
      unlockReason.trim().length < 10
    ) {
      setMessage({
        type: "error",
        text:
          "Unlock reason must contain at least 10 characters.",
      });
      return;
    }

    if (
      action === "request_unlock" &&
      unlockScopes.length === 0
    ) {
      setMessage({
        type: "error",
        text:
          "Select at least one approved edit scope.",
      });
      return;
    }

    setWorkflowLoading(true);
    setMessage(null);

    try {
      let response: { message: string };

      if (action === "submit_lock") {
        response =
          await submitExitMeetingForLock(
            item.minute_id,
            {
              submission_comment:
                workflowComment.trim() ||
                null,
            },
          );
      } else if (
        action === "request_unlock"
      ) {
        response =
          await requestExitMeetingUnlock(
            item.minute_id,
            {
              request_reason:
                unlockReason.trim(),
              edit_scope: unlockScopes,
            },
          );
      } else if (
        action === "cancel_unlock"
      ) {
        if (
          item.current_unlock_request_id ==
          null
        ) {
          throw new Error(
            "No pending unlock request was found.",
          );
        }

        response =
          await cancelExitMeetingUnlockRequest(
            item.current_unlock_request_id,
          );
      } else {
        response =
          await submitExitMeetingForRelock(
            item.minute_id,
            {
              submission_comment:
                workflowComment.trim() ||
                null,
            },
          );
      }

      closeWorkflowModal();
      await loadExitMeetingMinutes();

      setMessage({
        type: "success",
        text: response.message,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Workflow action failed.",
      });
    } finally {
      setWorkflowLoading(false);
    }
  };

  const openHistoryDrawer = async (
    item: ExitMeetingMinute,
  ) => {
    setHistoryItem(item);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistorySnapshots([]);
    setHistoryEvents([]);
    setHistoryUnlockRequest(null);

    try {
      const [summary, snapshotResponse] =
        await Promise.all([
          getExitMeetingWorkflowSummary(
            item.minute_id,
          ),
          listExitMeetingSnapshots(
            item.minute_id,
          ),
        ]);

      setHistorySnapshots(
        snapshotResponse.items,
      );
      setHistoryEvents(
        summary.recent_events,
      );
      setHistoryUnlockRequest(
        summary.current_unlock_request,
      );
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

  const closeHistoryDrawer = () => {
    if (historyLoading) return;

    setHistoryOpen(false);
    setHistoryItem(null);
    setHistorySnapshots([]);
    setHistoryEvents([]);
    setHistoryUnlockRequest(null);
  };

  const minuteInformationDisabled =
    drawerMode === "edit" &&
    selectedItem != null &&
    !isEditScopeAllowed(
      selectedItem,
      "minute_information",
    );

  const chairmanDisabled =
    drawerMode === "edit" &&
    selectedItem != null &&
    !isEditScopeAllowed(
      selectedItem,
      "chairman",
    );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-950 to-blue-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                Audit Meeting
              </p>
              <h1 className="mt-2 text-3xl font-black">Exit Meeting Minutes</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Generate print-ready exit meeting minutes from Meeting Master,
                participants, and General Discussion Issue records.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {minuteActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {minuteActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {minuteActions.canImport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Import
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPageSize(value as CrudPageSizeOption);
            resetToFirstPage();
          }}
          onRefresh={loadExitMeetingMinutes}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            resetToFirstPage();
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search meeting, client, venue, chairman...",
              onChange: (value) => {
                setSearch(value);
                resetToFirstPage();
              },
            },
            {
              key: "status",
              label: "Status",
              type: "select",
              value: statusFilter,
              options: [
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
              onChange: (value) => {
                setStatusFilter(value as StatusFilter);
                resetToFirstPage();
              },
            },
          ]}
        />

        {message && !drawerOpen ? (
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Meeting</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Audit Type</th>
                <th className="px-5 py-4">Meeting Date</th>
                <th className="px-5 py-4">Venue</th>
                <th className="px-5 py-4">Chairman</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Workflow</th>
                <th className="px-5 py-4">Active</th>
                {showRowActions ? (
                  <th className="px-5 py-4 text-right">Action</th>
                ) : null}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="flex items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="animate-spin" size={22} />
                      Loading Exit Meeting Minutes records...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <FileText size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Exit Meeting Minutes records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first exit meeting minutes record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => (
                    <tr key={item.minute_id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        #{item.minute_id}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800">
                        {item.meeting_name || `Meeting #${item.meeting_id}`}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.client_name || item.client_code || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.meeting_type || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(item.meeting_date)}
                      </td>
                      <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                        {item.meeting_venue || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.chairman_name || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <CrudPillBadge>{toTitle(item.status)}</CrudPillBadge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <CrudPillBadge>
                            {toTitle(item.workflow_status)}
                          </CrudPillBadge>
                          <p className="text-xs font-bold text-slate-400">
                            {item.is_locked
                              ? `Locked · Snapshot v${item.snapshot_version}`
                              : item.workflow_status ===
                                  "unlocked_for_edit"
                                ? "Controlled edit active"
                                : `Workflow v${item.workflow_version}`}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <CrudStatusBadge active={item.is_active} />
                      </td>

                      {showRowActions ? (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/audit-meetings/minutes/exit/${item.minute_id}/report`}
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                              title="View Report"
                            >
                              <Eye size={16} />
                            </Link>

                            <button
                              onClick={() =>
                                void openHistoryDrawer(item)
                              }
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-violet-50 hover:text-violet-600"
                              title="Snapshot and Workflow History"
                            >
                              <History size={16} />
                            </button>

                            {item.is_active &&
                            minuteActions.canSubmit &&
                            [
                              "draft",
                              "changes_requested",
                            ].includes(
                              item.workflow_status,
                            ) ? (
                              <button
                                onClick={() =>
                                  openWorkflowModal(
                                    item,
                                    "submit_lock",
                                  )
                                }
                                className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                                title="Submit for Lock Approval"
                              >
                                <Send size={16} />
                              </button>
                            ) : null}

                            {item.is_active &&
                            item.is_locked &&
                            item.workflow_status ===
                              "locked" &&
                            minuteActions.canRequestUnlock ? (
                              <button
                                onClick={() =>
                                  openWorkflowModal(
                                    item,
                                    "request_unlock",
                                  )
                                }
                                className="rounded-lg border border-amber-100 bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100"
                                title="Request Unlock"
                              >
                                <KeyRound size={16} />
                              </button>
                            ) : null}

                            {item.is_active &&
                            item.workflow_status ===
                              "pending_unlock_approval" &&
                            item.current_unlock_request_id !=
                              null &&
                            minuteActions.canCancelUnlock ? (
                              <button
                                onClick={() =>
                                  openWorkflowModal(
                                    item,
                                    "cancel_unlock",
                                  )
                                }
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                                title="Cancel Unlock Request"
                              >
                                <XCircle size={16} />
                              </button>
                            ) : null}

                            {item.is_active &&
                            item.workflow_status ===
                              "unlocked_for_edit" &&
                            minuteActions.canSubmit ? (
                              <button
                                onClick={() =>
                                  openWorkflowModal(
                                    item,
                                    "submit_relock",
                                  )
                                }
                                className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                                title="Submit for Relock Approval"
                              >
                                <Lock size={16} />
                              </button>
                            ) : null}

                            {minuteActions.canUpdate &&
                            isWorkflowEditable(item) ? (
                              <button
                                onClick={() => openEditDrawer(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {item.is_active &&
                            minuteActions.canDelete &&
                            isLifecycleAllowed(item) ? (
                              <button
                                onClick={() => openConfirm(item, "inactive")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            minuteActions.canRestore &&
                            isLifecycleAllowed(item) ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            minuteActions.canPermanentDelete &&
                            isLifecycleAllowed(item) ? (
                              <button
                                onClick={() =>
                                  openConfirm(item, "permanent_delete")
                                }
                                className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                title="Permanent Delete"
                              >
                                <AlertTriangle size={16} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <CrudPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={numericPageSize}
          onPageChange={setPage}
        />
      </section>

      <CrudDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title="Exit Meeting Minutes"
        description={
          drawerMode === "create"
            ? sessionCreatedCount > 0
              ? `Create — ${sessionCreatedCount} minute${sessionCreatedCount === 1 ? "" : "s"} added in this session`
              : "Create"
            : "Edit"
        }
        maxWidthClassName="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            {drawerMode === "create" ? (
              <>
                <button
                  type="submit"
                  form="exit-meeting-minute-form"
                  disabled={submitLoading}
                  onClick={() => setSaveMode("add_another")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading && saveMode === "add_another" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Save & Add Another
                </button>

                <button
                  type="submit"
                  form="exit-meeting-minute-form"
                  disabled={submitLoading}
                  onClick={() => setSaveMode("close")}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading && saveMode === "close" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Save & Close
                </button>
              </>
            ) : (
              <button
                type="submit"
                form="exit-meeting-minute-form"
                disabled={submitLoading}
                onClick={() => setSaveMode("close")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Update
              </button>
            )}
          </>
        }
      >
        <form
          ref={formRef}
          id="exit-meeting-minute-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <fieldset
            disabled={minuteInformationDisabled}
            className={
              minuteInformationDisabled
                ? "space-y-2 opacity-60"
                : "space-y-2"
            }
          >
            <CrudSelectField
              label="Meeting Master"
              value={form.meeting_id}
              options={[
                {
                  value: "",
                  label: catalogLoading
                    ? "Loading meetings..."
                    : "Select Meeting Master",
                },
                ...meetingOptions.map((meeting) => ({
                  value: String(meeting.meeting_id),
                  label: buildMeetingLabel(meeting),
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  meeting_id: value,
                  chairman_participant_id: "",
                }))
              }
            />

            {minuteInformationDisabled ? (
              <p className="text-xs font-bold text-amber-700">
                Minute Information is outside the approved edit scope.
              </p>
            ) : null}
          </fieldset>

          {selectedMeeting ? (
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm md:grid-cols-2">
              <DetailItem
                label="Audit Type"
                value={selectedMeeting.meeting_type}
              />
              <DetailItem
                label="Client Code"
                value={selectedMeeting.client_code}
              />
              <DetailItem
                label="Audit Year"
                value={selectedMeeting.audit_year}
              />
              <DetailItem
                label="Meeting Date"
                value={formatDate(selectedMeeting.meeting_date)}
              />
              <div className="md:col-span-2">
                <DetailItem
                  label="Venue"
                  value={selectedMeeting.meeting_venue}
                />
              </div>
            </div>
          ) : null}

          <fieldset
            disabled={chairmanDisabled}
            className={
              chairmanDisabled
                ? "space-y-2 opacity-60"
                : "space-y-2"
            }
          >
            <CrudSelectField
              label="Chairman of Meeting"
              value={form.chairman_participant_id}
              options={[
                {
                  value: "",
                  label: participantLoading
                    ? "Loading participants..."
                    : "Select Chairman from Meeting Participants",
                },
                ...filteredChairmanOptions.map((participant) => ({
                  value: String(participant.participant_id),
                  label: buildChairmanLabel(participant),
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  chairman_participant_id: value,
                }))
              }
            />

            {chairmanDisabled ? (
              <p className="text-xs font-bold text-amber-700">
                Chairman is outside the approved edit scope.
              </p>
            ) : null}
          </fieldset>

          <fieldset
            disabled={minuteInformationDisabled}
            className={
              minuteInformationDisabled
                ? "space-y-2 opacity-60"
                : "space-y-2"
            }
          >
            <CrudSelectField
              label="Status"
              value={form.status}
              options={statusOptions}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value,
                }))
              }
            />
          </fieldset>

          {message && drawerOpen ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}
        </form>
      </CrudDrawer>

      <CrudDrawer
        isOpen={historyOpen}
        onClose={closeHistoryDrawer}
        title="Workflow History"
        description={
          historyItem
            ? `Exit Meeting Minute #${historyItem.minute_id}`
            : "Snapshot and event history"
        }
        maxWidthClassName="max-w-4xl"
        footer={
          <button
            type="button"
            onClick={closeHistoryDrawer}
            disabled={historyLoading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Close
          </button>
        }
      >
        {historyLoading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Loading workflow history...
          </div>
        ) : (
          <div className="space-y-6">
            {historyUnlockRequest ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                  Current Unlock Request
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {historyUnlockRequest.request_reason}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  Status:{" "}
                  {toTitle(
                    historyUnlockRequest.request_status,
                  )}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Requested by{" "}
                  {historyUnlockRequest.requested_by_user_id}{" "}
                  on{" "}
                  {formatDateTime(
                    historyUnlockRequest.requested_at,
                  )}
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
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-400">
                    No immutable snapshot has been created yet.
                  </div>
                ) : (
                  historySnapshots.map((snapshot) => (
                    <div
                      key={snapshot.snapshot_id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900">
                            Snapshot v
                            {snapshot.snapshot_version}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {toTitle(
                              snapshot.snapshot_kind,
                            )}{" "}
                            ·{" "}
                            {formatDateTime(
                              snapshot.locked_at,
                            )}
                          </p>
                        </div>

                        <CrudPillBadge>
                          {snapshot.is_current
                            ? "Current"
                            : "Historical"}
                        </CrudPillBadge>
                      </div>

                      <p className="mt-3 break-all text-xs font-medium text-slate-500">
                        SHA-256:{" "}
                        {snapshot.snapshot_hash}
                      </p>
                    </div>
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
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-400">
                    No workflow event has been recorded yet.
                  </div>
                ) : (
                  historyEvents.map((event) => (
                    <div
                      key={event.event_id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900">
                            {toTitle(event.event_type)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {toTitle(event.from_status)}{" "}
                            →{" "}
                            {toTitle(event.to_status)}
                          </p>
                        </div>

                        <p className="text-xs font-bold text-slate-400">
                          {formatDateTime(
                            event.performed_at,
                          )}
                        </p>
                      </div>

                      {event.event_comment ? (
                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                          {event.event_comment}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs font-semibold text-slate-400">
                        Actor:{" "}
                        {event.performed_by_user_id ||
                          "System"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </CrudDrawer>

      {workflowModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                {workflowModal.action ===
                "request_unlock" ? (
                  <KeyRound size={24} />
                ) : workflowModal.action ===
                  "cancel_unlock" ? (
                  <XCircle size={24} />
                ) : workflowModal.action ===
                  "submit_relock" ? (
                  <Lock size={24} />
                ) : (
                  <Send size={24} />
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {
                    workflowActionLabel[
                      workflowModal.action
                    ]
                  }
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Minute #
                  {workflowModal.item.minute_id} —{" "}
                  {workflowModal.item.meeting_name ||
                    `Meeting ${workflowModal.item.meeting_id}`}
                </p>
              </div>
            </div>

            {workflowModal.action ===
            "request_unlock" ? (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-black text-slate-700">
                    Reason for Unlock
                  </label>
                  <textarea
                    value={unlockReason}
                    onChange={(event) =>
                      setUnlockReason(
                        event.target.value,
                      )
                    }
                    rows={4}
                    placeholder="Explain why this locked report requires editing..."
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-700">
                    Requested Edit Scope
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {editScopeOptions.map(
                      (option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={unlockScopes.includes(
                              option.value,
                            )}
                            onChange={() =>
                              toggleUnlockScope(
                                option.value,
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          {option.label}
                        </label>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : workflowModal.action ===
              "cancel_unlock" ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                The pending unlock request will be cancelled and the record will return to the Locked state.
              </div>
            ) : (
              <div className="mt-6">
                <label className="text-sm font-black text-slate-700">
                  Submission Comment
                </label>
                <textarea
                  value={workflowComment}
                  onChange={(event) =>
                    setWorkflowComment(
                      event.target.value,
                    )
                  }
                  rows={4}
                  placeholder="Optional note for the checker..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeWorkflowModal}
                disabled={workflowLoading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleWorkflowAction}
                disabled={workflowLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {workflowLoading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmItem && confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Confirm Action
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to{" "}
                  <span className="font-black text-slate-700">
                    {confirmActionLabel[confirmAction]}
                  </span>{" "}
                  this Exit Meeting Minutes record?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  #{confirmItem.minute_id} — {confirmItem.meeting_name}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submitLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
