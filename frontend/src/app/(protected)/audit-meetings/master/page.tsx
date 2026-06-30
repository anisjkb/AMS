"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CalendarCheck,
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
import CrudDateField from "@/components/crud/fields/CrudDateField";
import CrudNumberField from "@/components/crud/fields/CrudNumberField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import {
  createMeetingMaster,
  deactivateMeetingMaster,
  listMeetingMaster,
  permanentDeleteMeetingMaster,
  restoreMeetingMaster,
  updateMeetingMaster,
  type MeetingMaster,
  type MeetingMasterPayload,
} from "@/services/meetingMaster";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  meeting_type: string;
  client_id: string;
  client_code: string;
  audit_year: string;
  meeting_date: string;
  audit_start_date: string;
  audit_end_date: string;
  meeting_venue: string;
  meeting_note1: string;
  status: string;
};

const emptyForm: FormState = {
  meeting_type: "",
  client_id: "",
  client_code: "",
  audit_year: "",
  meeting_date: "",
  audit_start_date: "",
  audit_end_date: "",
  meeting_venue: "",
  meeting_note1: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "inactive", label: "Inactive" },
];

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

function buildFormFromItem(item: MeetingMaster): FormState {
  return {
    meeting_type: item.meeting_type,
    client_id: String(item.client_id),
    client_code: item.client_code,
    audit_year: item.audit_year,
    meeting_date: item.meeting_date,
    audit_start_date: item.audit_start_date,
    audit_end_date: item.audit_end_date,
    meeting_venue: item.meeting_venue,
    meeting_note1: item.meeting_note1,
    status: item.status,
  };
}

function buildPayload(form: FormState): MeetingMasterPayload {
  return {
    meeting_type: form.meeting_type.trim(),
    client_id: Number.parseInt(form.client_id, 10),
    client_code: form.client_code.trim(),
    audit_year: form.audit_year.trim(),
    meeting_date: form.meeting_date,
    audit_start_date: form.audit_start_date,
    audit_end_date: form.audit_end_date,
    meeting_venue: form.meeting_venue.trim(),
    meeting_note1: form.meeting_note1.trim(),
    status: form.status.trim(),
  };
}

export default function MeetingMasterPage() {
  const meetingMasterActions = useModuleActions("meeting_master");

  const [items, setItems] = useState<MeetingMaster[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<MeetingMaster | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<MeetingMaster | null>(null);
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

  const showTopActions = meetingMasterActions.showTopActions;
  const showRowActions = meetingMasterActions.showRowActions;
  const tableColumnCount = showRowActions ? 12 : 11;

  const loadMeetingMaster = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listMeetingMaster({
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
          : "Failed to load Meeting Master records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMeetingMaster();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadMeetingMaster]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: MeetingMaster) => {
    setDrawerMode("edit");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const openConfirm = (item: MeetingMaster, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    const requiredFields: Array<[keyof FormState, string]> = [
      ["meeting_type", "Meeting type is required."],
      ["client_id", "Client ID is required."],
      ["client_code", "Client code is required."],
      ["audit_year", "Audit year is required."],
      ["meeting_date", "Meeting date is required."],
      ["audit_start_date", "Audit start date is required."],
      ["audit_end_date", "Audit end date is required."],
      ["meeting_venue", "Meeting venue is required."],
      ["meeting_note1", "Meeting note is required."],
      ["status", "Status is required."],
    ];

    for (const [field, errorText] of requiredFields) {
      if (!form[field].trim()) {
        setMessage({ type: "error", text: errorText });
        return false;
      }
    }

    const clientId = Number.parseInt(form.client_id, 10);
    if (Number.isNaN(clientId) || clientId <= 0) {
      setMessage({ type: "error", text: "Client ID must be a valid positive number." });
      return false;
    }

    if (form.audit_end_date < form.audit_start_date) {
      setMessage({
        type: "error",
        text: "Audit end date cannot be before audit start date.",
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
          ? "Meeting Master record created successfully."
          : "Meeting Master record updated successfully.";

      if (drawerMode === "create") {
        await createMeetingMaster(buildPayload(form));
      } else if (selectedItem) {
        await updateMeetingMaster(selectedItem.meeting_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadMeetingMaster();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Meeting Master request failed.";

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
        await deactivateMeetingMaster(confirmItem.meeting_id);
        setMessage({
          type: "success",
          text: "Meeting Master record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreMeetingMaster(confirmItem.meeting_id);
        setMessage({
          type: "success",
          text: "Meeting Master record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteMeetingMaster(confirmItem.meeting_id);
        setMessage({
          type: "success",
          text: "Meeting Master record permanently deleted successfully.",
        });
      }

      closeConfirm();
      await loadMeetingMaster();
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
              <h1 className="mt-2 text-3xl font-black">Meeting Master</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Maintain audit meeting information, client reference, audit
                period, venue, meeting date, notes, and workflow status.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {meetingMasterActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {meetingMasterActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {meetingMasterActions.canImport ? (
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
          onRefresh={loadMeetingMaster}
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
              placeholder: "Search type, client code, year, venue, status...",
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
                <th className="px-5 py-4">Meeting Type</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Audit Year</th>
                <th className="px-5 py-4">Meeting Date</th>
                <th className="px-5 py-4">Audit Period</th>
                <th className="px-5 py-4">Venue</th>
                <th className="px-5 py-4">Workflow</th>
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
                      Loading Meeting Master records...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <CalendarCheck
                        size={42}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Meeting Master records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create a meeting record to begin audit meeting tracking.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => (
                    <tr key={item.meeting_id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        #{item.meeting_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-800">
                          {item.meeting_type}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-400">
                          {item.meeting_note1.slice(0, 70)}
                          {item.meeting_note1.length > 70 ? "..." : ""}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-bold text-slate-700">
                          {item.client_code}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {item.client_id}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-600">
                        {item.audit_year}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(item.meeting_date)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(item.audit_start_date)} →{" "}
                        {formatDate(item.audit_end_date)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.meeting_venue}
                      </td>
                      <td className="px-5 py-4">
                        <CrudPillBadge>{toTitle(item.status)}</CrudPillBadge>
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
                            {meetingMasterActions.canUpdate ? (
                              <button
                                onClick={() => openEditDrawer(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {item.is_active && meetingMasterActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(item, "delete")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && meetingMasterActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            meetingMasterActions.canPermanentDelete ? (
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
        title="Meeting Master"
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
              form="meeting-master-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarCheck className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="meeting-master-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <CrudTextField
              label="Meeting Type"
              value={form.meeting_type}
              required
              placeholder="Example: Planning"
              onChange={(value) =>
                setForm((current) => ({ ...current, meeting_type: value }))
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
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CrudNumberField
              label="Client ID"
              value={form.client_id}
              required
              placeholder="Example: 1001"
              onChange={(value) =>
                setForm((current) => ({ ...current, client_id: value }))
              }
            />

            <CrudTextField
              label="Client Code"
              value={form.client_code}
              required
              placeholder="Example: C001"
              onChange={(value) =>
                setForm((current) => ({ ...current, client_code: value }))
              }
            />

            <CrudTextField
              label="Audit Year"
              value={form.audit_year}
              required
              placeholder="Example: 2026"
              onChange={(value) =>
                setForm((current) => ({ ...current, audit_year: value }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CrudDateField
              label="Meeting Date"
              value={form.meeting_date}
              required
              onChange={(value) =>
                setForm((current) => ({ ...current, meeting_date: value }))
              }
            />

            <CrudDateField
              label="Audit Start Date"
              value={form.audit_start_date}
              required
              onChange={(value) =>
                setForm((current) => ({ ...current, audit_start_date: value }))
              }
            />

            <CrudDateField
              label="Audit End Date"
              value={form.audit_end_date}
              required
              onChange={(value) =>
                setForm((current) => ({ ...current, audit_end_date: value }))
              }
            />
          </div>

          <CrudTextField
            label="Meeting Venue"
            value={form.meeting_venue}
            required
            placeholder="Example: Head Office Meeting Room"
            onChange={(value) =>
              setForm((current) => ({ ...current, meeting_venue: value }))
            }
          />

          <CrudTextAreaField
            label="Meeting Note"
            value={form.meeting_note1}
            rows={5}
            onChange={(value) =>
              setForm((current) => ({ ...current, meeting_note1: value }))
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
                  this Meeting Master record?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmItem.meeting_type} — {confirmItem.client_code}
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
