"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";

import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudPillBadge, CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import { listMeetingMaster, type MeetingMaster } from "@/services/meetingMaster";
import {
  createMeetingParticipant,
  deactivateMeetingParticipant,
  listMeetingParticipantEntityContacts,
  listMeetingParticipantInternalTeams,
  listMeetingParticipants,
  permanentDeleteMeetingParticipant,
  restoreMeetingParticipant,
  type EntityContactOption,
  type InternalTeamOption,
  type MeetingParticipant,
  type MeetingParticipantPayload,
  type MeetingParticipantSourceType,
} from "@/services/meetingParticipant";
import { listMeetingTypes, type MeetingType } from "@/services/meetingType";

type StatusFilter = "all" | "active" | "inactive";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  meeting_type_id: string;
  meeting_id: string;
  source_type: MeetingParticipantSourceType | "";
  audit_team_id: string;
  entity_contact_id: string;
};

type AuditEntityOption = {
  id: number;
  entity_name: string;
  entity_code: string;
};

async function listAuditEntityOptions() {
  const response = await fetch(
    "/api/backend/audit-entities?page=1&page_size=100&sort_by=id&sort_order=desc&is_active=true",
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load audit entities.");
  }

  return (await response.json()) as { items: AuditEntityOption[] };
}

const emptyForm: FormState = {
  meeting_type_id: "",
  meeting_id: "",
  source_type: "",
  audit_team_id: "",
  entity_contact_id: "",
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

function getConfirmActionLabel(action: ConfirmAction) {
  if (action === "delete") return "Inactive";
  if (action === "restore") return "Restore";
  if (action === "permanent_delete") return "Permanent Delete";

  return toTitle(action);
}

function buildMeetingLabel(meeting: MeetingMaster) {
  return `${meeting.meeting_name} (${meeting.client_code} - ${meeting.audit_year})`;
}

function buildPayload(form: FormState): MeetingParticipantPayload {
  const sourceType = form.source_type as MeetingParticipantSourceType;

  return {
    meeting_id: Number.parseInt(form.meeting_id, 10),
    source_type: sourceType,
    audit_team_id:
      sourceType === "internal_audit_team"
        ? Number.parseInt(form.audit_team_id, 10)
        : null,
    entity_contact_id:
      sourceType === "client_entity_team"
        ? Number.parseInt(form.entity_contact_id, 10)
        : null,
  };
}

export default function MeetingParticipantsPage() {
  const participantActions = useModuleActions("meeting_participant");

  const [items, setItems] = useState<MeetingParticipant[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [meetingOptions, setMeetingOptions] = useState<MeetingMaster[]>([]);
  const [internalTeamOptions, setInternalTeamOptions] = useState<
    InternalTeamOption[]
  >([]);
  const [entityContactOptions, setEntityContactOptions] = useState<
    EntityContactOption[]
  >([]);
  const [entityOptions, setEntityOptions] = useState<AuditEntityOption[]>([]);

  const [optionLoading, setOptionLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitMode, setSubmitMode] = useState<"close" | "add_another">("close");
  const participantSourceFieldRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<MeetingParticipant | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

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

  const filteredMeetingOptions = useMemo(() => {
    if (!form.meeting_type_id) return [];

    return meetingOptions.filter(
      (meeting) => String(meeting.meeting_type_id) === form.meeting_type_id,
    );
  }, [form.meeting_type_id, meetingOptions]);

  const selectedMeeting = useMemo(() => {
    if (!form.meeting_id) return null;

    return (
      meetingOptions.find(
        (meeting) => String(meeting.meeting_id) === form.meeting_id,
      ) ?? null
    );
  }, [form.meeting_id, meetingOptions]);

  const entityMap = useMemo(() => {
    return new Map(entityOptions.map((entity) => [entity.id, entity]));
  }, [entityOptions]);

  const selectedMeetingClientName = useMemo(() => {
    if (!selectedMeeting?.client_id) return null;

    return entityMap.get(selectedMeeting.client_id)?.entity_name ?? null;
  }, [entityMap, selectedMeeting]);

  const showTopActions = participantActions.showTopActions;
  const showRowActions = participantActions.showRowActions;
  const tableColumnCount = showRowActions ? 9 : 8;

  const loadParticipants = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listMeetingParticipants({
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
          : "Failed to load Meeting Participant records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadOptions = useCallback(async () => {
    setOptionLoading(true);

    try {
      const [typeResponse, meetingResponse, teamResponse, entityResponse] =
        await Promise.all([
          listMeetingTypes({
            page_size: 100,
            is_active: true,
            sort_by: "meeting_type_name",
            sort_order: "asc",
          }),
          listMeetingMaster({
            page: 1,
            pageSize: 100,
            isActive: true,
          }),
          listMeetingParticipantInternalTeams(),
          listAuditEntityOptions(),
        ]);

      setMeetingTypes(typeResponse.items);
      setMeetingOptions(meetingResponse.items);
      setInternalTeamOptions(teamResponse.items);
      setEntityOptions(entityResponse.items);
    } catch {
      setMeetingTypes([]);
      setMeetingOptions([]);
      setInternalTeamOptions([]);
      setEntityOptions([]);
    } finally {
      setOptionLoading(false);
    }
  }, []);

  const loadEntityContacts = useCallback(async (meetingId: string) => {
    if (!meetingId) {
      setEntityContactOptions([]);
      return;
    }

    setContactLoading(true);

    try {
      const response = await listMeetingParticipantEntityContacts(
        Number.parseInt(meetingId, 10),
      );

      setEntityContactOptions(response.items);
    } catch {
      setEntityContactOptions([]);
    } finally {
      setContactLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadParticipants();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadParticipants]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadOptions]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setSubmitMode("close");
    setForm(emptyForm);
    setDrawerOpen(true);
    void loadOptions();
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSubmitMode("close");
    setForm(emptyForm);
    setEntityContactOptions([]);
  };

  const openConfirm = (item: MeetingParticipant, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const focusParticipantSource = useCallback(() => {
    window.setTimeout(() => {
      const field = participantSourceFieldRef.current;
      const target = field?.querySelector(
        "select, button, input, [tabindex]:not([tabindex='-1'])",
      ) as HTMLElement | null;

      target?.focus();
    }, 120);
  }, []);

  const validateForm = () => {
    if (!form.meeting_type_id.trim()) {
      setMessage({ type: "error", text: "Meeting Type is required." });
      return false;
    }

    if (!form.meeting_id.trim()) {
      setMessage({ type: "error", text: "Meeting Name is required." });
      return false;
    }

    if (!form.source_type) {
      setMessage({ type: "error", text: "Participant Source is required." });
      return false;
    }

    if (
      form.source_type === "internal_audit_team" &&
      !form.audit_team_id.trim()
    ) {
      setMessage({ type: "error", text: "Audit Team is required." });
      return false;
    }

    if (
      form.source_type === "client_entity_team" &&
      !form.entity_contact_id.trim()
    ) {
      setMessage({ type: "error", text: "Entity contact is required." });
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
      const response = await createMeetingParticipant(buildPayload(form));

      await loadParticipants();

      const addedCount = Array.isArray(response.data) ? response.data.length : 0;
      const successMessage =
        addedCount > 1
          ? `${addedCount} Meeting Participants added successfully.`
          : response.message;

      if (submitMode === "add_another") {
        setForm((current) => ({
          ...current,
          source_type: "",
          audit_team_id: "",
          entity_contact_id: "",
        }));

        setMessage({ type: "success", text: successMessage });
        focusParticipantSource();
        return;
      }

      setDrawerOpen(false);
      setSubmitMode("close");
      setForm(emptyForm);
      setEntityContactOptions([]);

      setMessage({ type: "success", text: successMessage });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Meeting Participant request failed.";

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
      if (confirmAction === "delete") {
        await deactivateMeetingParticipant(confirmItem.participant_id);
        setMessage({
          type: "success",
          text: "Meeting Participant record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreMeetingParticipant(confirmItem.participant_id);
        setMessage({
          type: "success",
          text: "Meeting Participant record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteMeetingParticipant(confirmItem.participant_id);
        setMessage({
          type: "success",
          text: "Meeting Participant record permanently deleted successfully.",
        });
      }

      closeConfirm();
      await loadParticipants();
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
              <h1 className="mt-2 text-3xl font-black">Meeting Participants</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Add meeting participants from Internal Audit Team or Client/Entity contacts.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {participantActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {participantActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {participantActions.canImport ? (
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
          onRefresh={loadParticipants}
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
              placeholder: "Search meeting, source, participant, designation...",
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
                <th className="px-5 py-4">Meeting Name</th>
                <th className="px-5 py-4">Meeting Type</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Participant Name</th>
                <th className="px-5 py-4">Designation</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
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
                      Loading Meeting Participant records...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <Users size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Meeting Participant records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Add participants from an Internal Audit Team or Client/Entity contact.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => (
                    <tr key={item.participant_id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        #{item.participant_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-800">
                          {item.meeting_name || `Meeting #${item.meeting_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {entityMap.get(item.client_id ?? 0)?.entity_name || "-"}{" "}
                          <span>({item.client_code || "-"})</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-600">
                        {item.meeting_type || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <CrudPillBadge>{item.source_label || "-"}</CrudPillBadge>
                        {item.audit_team_name ? (
                          <div className="mt-1 text-xs text-slate-400">
                            {item.audit_team_name}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-slate-800">
                        {item.participant_name || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.designation || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <CrudStatusBadge active={item.is_active} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(item.created_at)}
                      </td>

                      {showRowActions ? (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {item.is_active && participantActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(item, "delete")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && participantActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            participantActions.canPermanentDelete ? (
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
        title="Meeting Participant"
        description="Create from source"
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

            <button
              type="submit"
              form="meeting-participant-form"
              disabled={submitLoading}
              onClick={() => setSubmitMode("close")}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading && submitMode === "close" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Save & Close
            </button>

            <button
              type="submit"
              form="meeting-participant-form"
              disabled={submitLoading}
              onClick={() => setSubmitMode("add_another")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading && submitMode === "add_another" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Save & Add Another
            </button>
          </>
        }
      >
        <form
          id="meeting-participant-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Meeting Type"
            value={form.meeting_type_id}
            options={[
              {
                value: "",
                label: optionLoading ? "Loading Meeting Types..." : "Select Meeting Type",
              },
              ...meetingTypes.map((meetingType) => ({
                value: String(meetingType.meeting_type_id),
                label: meetingType.meeting_type_name,
              })),
            ]}
            onChange={(value) => {
              setForm((current) => ({
                ...current,
                meeting_type_id: value,
                meeting_id: "",
                audit_team_id: "",
                entity_contact_id: "",
              }));
              setEntityContactOptions([]);
            }}
          />

          <CrudSelectField
            label="Meeting Name"
            value={form.meeting_id}
            options={[
              {
                value: "",
                label: form.meeting_type_id
                  ? "Select Meeting Name"
                  : "Select Meeting Type first",
              },
              ...filteredMeetingOptions.map((meeting) => ({
                value: String(meeting.meeting_id),
                label: buildMeetingLabel(meeting),
              })),
            ]}
            onChange={(value) => {
              setForm((current) => ({
                ...current,
                meeting_id: value,
                entity_contact_id: "",
              }));
              void loadEntityContacts(value);
            }}
          />

          {selectedMeeting ? (
            <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 md:grid-cols-2">
              <div>
                <span className="font-black">Meeting Name:</span>{" "}
                {selectedMeeting.meeting_name}
              </div>
              <div>
                <span className="font-black">Meeting Type:</span>{" "}
                {selectedMeeting.meeting_type}
              </div>
              <div>
                <span className="font-black">Client Name:</span>{" "}
                {selectedMeetingClientName || "-"}
              </div>
              <div>
                <span className="font-black">Client Code:</span>{" "}
                {selectedMeeting.client_code}
              </div>
              <div>
                <span className="font-black">Meeting Date:</span>{" "}
                {formatDate(selectedMeeting.meeting_date)}
              </div>
            </div>
          ) : null}

          <div ref={participantSourceFieldRef}>
            <CrudSelectField
              label="Participant Source"
              value={form.source_type}
              options={[
                { value: "", label: "Select Participant Source" },
                { value: "internal_audit_team", label: "From Internal Audit Team" },
                { value: "client_entity_team", label: "From Client/Entity Team" },
              ]}
              onChange={(value) => {
                setForm((current) => ({
                  ...current,
                  source_type: value as MeetingParticipantSourceType | "",
                  audit_team_id: "",
                  entity_contact_id: "",
                }));
              }}
            />
          </div>

          {form.source_type === "internal_audit_team" ? (
            <CrudSelectField
              label="Audit Team"
              value={form.audit_team_id}
              options={[
                {
                  value: "",
                  label: optionLoading ? "Loading Audit Teams..." : "Select Audit Team",
                },
                ...internalTeamOptions.map((team) => ({
                  value: String(team.team_id),
                  label: `${team.team_name} (Team #${team.team_id})`,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({ ...current, audit_team_id: value }))
              }
            />
          ) : null}

          {form.source_type === "client_entity_team" ? (
            <CrudSelectField
              label="Contact"
              value={form.entity_contact_id}
              options={[
                {
                  value: "",
                  label: contactLoading
                    ? "Loading Contacts..."
                    : form.meeting_id
                      ? "Select Contact"
                      : "Select Meeting Name first",
                },
                ...entityContactOptions.map((contact) => ({
                  value: String(contact.id),
                  label: `${contact.contact_name} (ID ${contact.id})`,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({ ...current, entity_contact_id: value }))
              }
            />
          ) : null}

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
                    {getConfirmActionLabel(confirmAction)}
                  </span>{" "}
                  this Meeting Participant record?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmItem.participant_name || `#${confirmItem.participant_id}`}
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



