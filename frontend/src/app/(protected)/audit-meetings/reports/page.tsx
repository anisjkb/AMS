"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
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
import CrudTextField from "@/components/crud/fields/CrudTextField";
import { listAuditEntities, type AuditEntity } from "@/services/auditEntity";
import { listMeetingMaster, type MeetingMaster } from "@/services/meetingMaster";
import {
  createMeetingReport,
  deactivateMeetingReport,
  listMeetingReports,
  permanentDeleteMeetingReport,
  restoreMeetingReport,
  updateMeetingReport,
  type MeetingReport,
  type MeetingReportPayload,
} from "@/services/meetingReport";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  meeting_id: string;
  location: string;
};

const emptyForm: FormState = {
  meeting_id: "",
  location: "",
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

function buildFormFromItem(item: MeetingReport): FormState {
  return {
    meeting_id: item.meeting_id ? String(item.meeting_id) : "",
    location: item.location ?? "",
  };
}

function buildPayload(form: FormState): MeetingReportPayload {
  return {
    meeting_id: Number.parseInt(form.meeting_id, 10),
    location: form.location.trim() || null,
  };
}

function buildMeetingLabel(
  meeting: MeetingMaster,
  entityMap: Map<number, AuditEntity>,
) {
  const entity = entityMap.get(meeting.client_id);
  const clientLabel = entity
    ? `${entity.entity_name} (${entity.entity_code})`
    : meeting.client_code;

  return `#${meeting.meeting_id} — ${meeting.meeting_type} — ${clientLabel} — ${meeting.audit_year}`;
}

export default function MeetingReportsPage() {
  const meetingReportActions = useModuleActions("meeting_report");

  const [items, setItems] = useState<MeetingReport[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [meetingOptions, setMeetingOptions] = useState<MeetingMaster[]>([]);
  const [entityOptions, setEntityOptions] = useState<AuditEntity[]>([]);
  const [meetingLoading, setMeetingLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<MeetingReport | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<MeetingReport | null>(null);
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

  const entityMap = useMemo(() => {
    return new Map(entityOptions.map((entity) => [entity.id, entity]));
  }, [entityOptions]);

  const selectedMeeting = useMemo(() => {
    if (!form.meeting_id) return null;

    return (
      meetingOptions.find(
        (meeting) => String(meeting.meeting_id) === form.meeting_id,
      ) ?? null
    );
  }, [form.meeting_id, meetingOptions]);

  const selectedMeetingEntity = useMemo(() => {
    if (!selectedMeeting) return null;

    return entityMap.get(selectedMeeting.client_id) ?? null;
  }, [entityMap, selectedMeeting]);

  const showTopActions = meetingReportActions.showTopActions;
  const showRowActions = meetingReportActions.showRowActions;
  const tableColumnCount = showRowActions ? 9 : 8;

  const loadMeetingReports = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listMeetingReports({
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
          : "Failed to load Meeting Report records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadMeetingOptions = useCallback(async () => {
    setMeetingLoading(true);

    try {
      const [meetingsResponse, entitiesResponse] = await Promise.all([
        listMeetingMaster({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "entity_name",
          sortOrder: "asc",
        }),
      ]);

      setMeetingOptions(meetingsResponse.items);
      setEntityOptions(entitiesResponse.items);
    } catch {
      setMeetingOptions([]);
      setEntityOptions([]);
    } finally {
      setMeetingLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMeetingReports();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadMeetingReports]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMeetingOptions();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadMeetingOptions]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    void loadMeetingOptions();
  };

  const openEditDrawer = (item: MeetingReport) => {
    setDrawerMode("edit");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
    void loadMeetingOptions();
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const openConfirm = (item: MeetingReport, action: ConfirmAction) => {
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

    const meetingId = Number.parseInt(form.meeting_id, 10);
    if (Number.isNaN(meetingId) || meetingId <= 0) {
      setMessage({
        type: "error",
        text: "Meeting Master must be a valid selection.",
      });
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
      const successText =
        drawerMode === "create"
          ? "Meeting Report record created successfully."
          : "Meeting Report record updated successfully.";

      if (drawerMode === "create") {
        await createMeetingReport(buildPayload(form));
      } else if (selectedItem) {
        await updateMeetingReport(selectedItem.report_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadMeetingReports();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Meeting Report request failed.";

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
        await deactivateMeetingReport(confirmItem.report_id);
        setMessage({
          type: "success",
          text: "Meeting Report record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreMeetingReport(confirmItem.report_id);
        setMessage({
          type: "success",
          text: "Meeting Report record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteMeetingReport(confirmItem.report_id);
        setMessage({
          type: "success",
          text: "Meeting Report record permanently deleted successfully.",
        });
      }

      closeConfirm();
      await loadMeetingReports();
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
              <h1 className="mt-2 text-3xl font-black">Meeting Reports</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Generate meeting reports from approved Meeting Master records.
                Details are synchronized from Meeting Master and Audit Entity.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {meetingReportActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {meetingReportActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {meetingReportActions.canImport ? (
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
          onRefresh={loadMeetingReports}
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
              placeholder: "Search meeting type, client, year, location...",
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
                <th className="px-5 py-4">Report ID</th>
                <th className="px-5 py-4">Meeting</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Audit Year</th>
                <th className="px-5 py-4">Meeting Date</th>
                <th className="px-5 py-4">Location</th>
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
                      Loading Meeting Report records...
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
                        No Meeting Report records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create a report from an existing Meeting Master record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => (
                    <tr key={item.report_id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        #{item.report_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-800">
                          {item.meeting_type}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Meeting ID: {item.meeting_id ?? "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-600">
                        {item.client_name}
                      </td>
                      <td className="px-5 py-4">
                        <CrudPillBadge>{item.audit_year}</CrudPillBadge>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(item.meeting_date)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.location || "-"}
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
                            {meetingReportActions.canUpdate ? (
                              <button
                                onClick={() => openEditDrawer(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {item.is_active && meetingReportActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(item, "delete")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && meetingReportActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            meetingReportActions.canPermanentDelete ? (
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
        title="Meeting Report"
        description={drawerMode === "create" ? "Create" : "Edit"}
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
              form="meeting-report-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="meeting-report-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Meeting Master"
            value={form.meeting_id}
            options={[
              {
                value: "",
                label: meetingLoading
                  ? "Loading Meeting Master records..."
                  : "Select Meeting Master",
              },
              ...meetingOptions.map((meeting) => ({
                value: String(meeting.meeting_id),
                label: buildMeetingLabel(meeting, entityMap),
              })),
            ]}
            onChange={(value) => {
              const meeting = meetingOptions.find(
                (item) => String(item.meeting_id) === value,
              );

              setForm((current) => ({
                ...current,
                meeting_id: value,
                location: meeting?.meeting_venue ?? current.location,
              }));
            }}
          />

          {selectedMeeting ? (
            <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 md:grid-cols-2">
              <div>
                <span className="font-black">Meeting Type:</span>{" "}
                {selectedMeeting.meeting_type}
              </div>
              <div>
                <span className="font-black">Client:</span>{" "}
                {selectedMeetingEntity
                  ? `${selectedMeetingEntity.entity_name} (${selectedMeetingEntity.entity_code})`
                  : selectedMeeting.client_code}
              </div>
              <div>
                <span className="font-black">Audit Year:</span>{" "}
                {selectedMeeting.audit_year}
              </div>
              <div>
                <span className="font-black">Meeting Date:</span>{" "}
                {formatDate(selectedMeeting.meeting_date)}
              </div>
              <div className="md:col-span-2">
                <span className="font-black">Default Location:</span>{" "}
                {selectedMeeting.meeting_venue}
              </div>
            </div>
          ) : null}

          <CrudTextField
            label="Report Location"
            value={form.location}
            placeholder="Leave blank to use Meeting Master venue"
            onChange={(value) =>
              setForm((current) => ({ ...current, location: value }))
            }
          />

          {message && drawerOpen && message.type === "error" ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
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
                    {toTitle(confirmAction)}
                  </span>{" "}
                  this Meeting Report record?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmItem.meeting_type} — {confirmItem.client_name}
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
