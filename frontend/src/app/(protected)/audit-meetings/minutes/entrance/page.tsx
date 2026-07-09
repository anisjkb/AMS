"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudPillBadge, CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import { listMeetingMaster, type MeetingMaster } from "@/services/meetingMaster";
import {
  listMeetingParticipants,
  type MeetingParticipant,
} from "@/services/meetingParticipant";
import {
  createEntranceMeetingMinute,
  deactivateEntranceMeetingMinute,
  listEntranceMeetingMinutes,
  permanentDeleteEntranceMeetingMinute,
  restoreEntranceMeetingMinute,
  updateEntranceMeetingMinute,
  type EntranceMeetingMinute,
  type EntranceMeetingMinutePayload,
} from "@/services/meetingMinutes/entranceMeetingMinute";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type SaveMode = "add_another" | "close";

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

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
    participant.participant_name || `Participant #${participant.participant_id}`,
    participant.designation,
    participant.source_label,
  ]
    .filter(Boolean)
    .join(" — ");
}

function buildFormFromItem(item: EntranceMeetingMinute): FormState {
  return {
    meeting_id: String(item.meeting_id),
    chairman_participant_id: String(item.chairman_participant_id),
    status: item.status,
  };
}

function buildPayload(form: FormState): EntranceMeetingMinutePayload {
  return {
    meeting_id: Number.parseInt(form.meeting_id, 10),
    chairman_participant_id: Number.parseInt(form.chairman_participant_id, 10),
    status: form.status.trim(),
  };
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
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

export default function EntranceMeetingMinutesPage() {
  const minuteActions = useModuleActions("entrance_meeting_minutes");

  const [items, setItems] = useState<EntranceMeetingMinute[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [meetingOptions, setMeetingOptions] = useState<MeetingMaster[]>([]);
  const [participantOptions, setParticipantOptions] = useState<MeetingParticipant[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [participantLoading, setParticipantLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);
  const [saveMode, setSaveMode] = useState<SaveMode>("close");
  const [sessionCreatedCount, setSessionCreatedCount] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<EntranceMeetingMinute | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<EntranceMeetingMinute | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

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
  const showRowActions = minuteActions.showRowActions;
  const tableColumnCount = showRowActions ? 10 : 9;

  const loadEntranceMeetingMinutes = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listEntranceMeetingMinutes({
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
          : "Failed to load Entrance Meeting Minutes records.";

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
          response.items.filter((item) => String(item.meeting_id) === meetingId),
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
      void loadEntranceMeetingMinutes();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadEntranceMeetingMinutes]);

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
      const selects = formRef.current?.querySelectorAll<HTMLSelectElement>("select");
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

  const openEditDrawer = (item: EntranceMeetingMinute) => {
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

  const openConfirm = (item: EntranceMeetingMinute, action: ConfirmAction) => {
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
        await createEntranceMeetingMinute(buildPayload(form));
        await loadEntranceMeetingMinutes();

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
            text: "Entrance Meeting Minutes record saved. Add another below.",
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
          text: "Entrance Meeting Minutes record created successfully.",
        });

        return;
      }

      if (selectedItem) {
        await updateEntranceMeetingMinute(
          selectedItem.minute_id,
          buildPayload(form),
        );
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);
      setParticipantOptions([]);

      await loadEntranceMeetingMinutes();

      setMessage({
        type: "success",
        text: "Entrance Meeting Minutes record updated successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Entrance Meeting Minutes request failed.";

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
        await deactivateEntranceMeetingMinute(confirmItem.minute_id);
        setMessage({
          type: "success",
          text: "Entrance Meeting Minutes record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreEntranceMeetingMinute(confirmItem.minute_id);
        setMessage({
          type: "success",
          text: "Entrance Meeting Minutes record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteEntranceMeetingMinute(confirmItem.minute_id);
        setMessage({
          type: "success",
          text: "Entrance Meeting Minutes record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadEntranceMeetingMinutes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-950 to-blue-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                Audit Meeting
              </p>
              <h1 className="mt-2 text-3xl font-black">
                Entrance Meeting Minutes
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Generate print-ready entrance meeting minutes from Meeting Master,
                participants, and General Discussion Issue records.
              </p>
            </div>

            {showTopActions && minuteActions.canCreate ? (
              <button
                onClick={openCreateDrawer}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
              >
                <Plus size={18} />
                Create
              </button>
            ) : null}
          </div>
        </div>

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPageSize(value as CrudPageSizeOption);
            resetToFirstPage();
          }}
          onRefresh={loadEntranceMeetingMinutes}
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
                      Loading Entrance Meeting Minutes records...
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
                        No Entrance Meeting Minutes records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first entrance meeting minutes record.
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
                        <CrudStatusBadge active={item.is_active} />
                      </td>

                      {showRowActions ? (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/audit-meetings/minutes/entrance/${item.minute_id}/report`}
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                              title="View Report"
                            >
                              <Eye size={16} />
                            </Link>

                            {minuteActions.canUpdate ? (
                              <button
                                onClick={() => openEditDrawer(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {item.is_active && minuteActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(item, "inactive")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && minuteActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && minuteActions.canPermanentDelete ? (
                              <button
                                onClick={() => openConfirm(item, "permanent_delete")}
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
        title="Entrance Meeting Minutes"
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
                  form="entrance-meeting-minute-form"
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
                  form="entrance-meeting-minute-form"
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
                form="entrance-meeting-minute-form"
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
          id="entrance-meeting-minute-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Meeting Master"
            value={form.meeting_id}
            options={[
              {
                value: "",
                label: catalogLoading ? "Loading meetings..." : "Select Meeting Master",
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

          {selectedMeeting ? (
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm md:grid-cols-2">
              <DetailItem label="Audit Type" value={selectedMeeting.meeting_type} />
              <DetailItem label="Client Code" value={selectedMeeting.client_code} />
              <DetailItem label="Audit Year" value={selectedMeeting.audit_year} />
              <DetailItem
                label="Meeting Date"
                value={formatDate(selectedMeeting.meeting_date)}
              />
              <div className="md:col-span-2">
                <DetailItem label="Venue" value={selectedMeeting.meeting_venue} />
              </div>
            </div>
          ) : null}

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

          <CrudSelectField
            label="Status"
            value={form.status}
            options={statusOptions}
            onChange={(value) =>
              setForm((current) => ({ ...current, status: value }))
            }
          />

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
                  this Entrance Meeting Minutes record?
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
