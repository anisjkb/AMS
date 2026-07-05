"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Tags,
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
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import {
  createMeetingType,
  deactivateMeetingType,
  listMeetingTypes,
  permanentDeleteMeetingType,
  restoreMeetingType,
  updateMeetingType,
  type MeetingType,
  type MeetingTypePayload,
} from "@/services/meetingType";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type SaveMode = "add_another" | "close";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  meeting_type_name: string;
  description: string;
  status: string;
};

const emptyForm: FormState = {
  meeting_type_name: "",
  description: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const confirmActionLabel: Record<ConfirmAction, string> = {
  inactive: "Inactive",
  restore: "Restore",
  permanent_delete: "Permanently Delete",
};

const confirmButtonLabel: Record<ConfirmAction, string> = {
  inactive: "Inactive",
  restore: "Restore",
  permanent_delete: "Permanently Delete",
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

function truncateText(value: string | null | undefined, limit = 90) {
  if (!value) return "-";

  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function buildFormFromItem(item: MeetingType): FormState {
  return {
    meeting_type_name: item.meeting_type_name,
    description: item.description ?? "",
    status: item.status,
  };
}

function buildPayload(form: FormState): MeetingTypePayload {
  return {
    meeting_type_name: form.meeting_type_name.trim(),
    description: form.description.trim() || null,
    status: form.status.trim(),
  };
}

export default function MeetingTypePage() {
  // Temporary: backend currently reuses Meeting Master permissions for Meeting Type.
  // When Meeting Type gets its own menu permission, change this to "meeting_type".
  const meetingTypeActions = useModuleActions("meeting_master");

  const [items, setItems] = useState<MeetingType[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<MeetingType | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<MeetingType | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const [sessionCreatedCount, setSessionCreatedCount] = useState(0);
  const [saveMode, setSaveMode] = useState<SaveMode>("close");

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

  const showTopActions = meetingTypeActions.showTopActions;
  const showRowActions = meetingTypeActions.showRowActions;
  const tableColumnCount = showRowActions ? 7 : 6;

  const loadMeetingTypes = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listMeetingTypes({
        page,
        page_size: numericPageSize,
        search: debouncedSearch,
        sort_by: "meeting_type_id",
        sort_order: "desc",
        is_active: isActiveFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load Meeting Type records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMeetingTypes();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadMeetingTypes]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm(emptyForm);
    setSessionCreatedCount(0);
    setSaveMode("close");
    setMessage(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: MeetingType) => {
    setDrawerMode("edit");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setSessionCreatedCount(0);
    setSaveMode("close");
    setMessage(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
    setSessionCreatedCount(0);
    setSaveMode("close");
  };

  const openConfirm = (item: MeetingType, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.meeting_type_name.trim()) {
      setMessage({
        type: "error",
        text: "Meeting type name is required.",
      });
      return false;
    }

    if (!form.status.trim()) {
      setMessage({
        type: "error",
        text: "Status is required.",
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
      if (drawerMode === "create") {
        await createMeetingType(buildPayload(form));
        await loadMeetingTypes();

        if (saveMode === "add_another") {
          setSessionCreatedCount((current) => current + 1);
          setForm(emptyForm);
          setMessage({
            type: "success",
            text: "Meeting Type created successfully. Add another record.",
          });
          return;
        }

        setDrawerOpen(false);
        setForm(emptyForm);
        setMessage({
          type: "success",
          text: "Meeting Type created successfully.",
        });
        return;
      }

      if (selectedItem) {
        await updateMeetingType(selectedItem.meeting_type_id, buildPayload(form));
        await loadMeetingTypes();

        setDrawerOpen(false);
        setSelectedItem(null);
        setForm(emptyForm);
        setMessage({
          type: "success",
          text: "Meeting Type updated successfully.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save Meeting Type.";

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
        await deactivateMeetingType(confirmItem.meeting_type_id);
        setStatusFilter("inactive");
        setPage(1);
        setMessage({
          type: "success",
          text: "Meeting Type marked inactive successfully. You are now viewing inactive records for restore or permanent delete.",
        });
      }

      if (confirmAction === "restore") {
        await restoreMeetingType(confirmItem.meeting_type_id);
        setStatusFilter("active");
        setPage(1);
        setMessage({
          type: "success",
          text: "Meeting Type restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteMeetingType(confirmItem.meeting_type_id);
        setMessage({
          type: "success",
          text: "Meeting Type permanently deleted successfully.",
        });
      }

      closeConfirm();
      await loadMeetingTypes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-7 py-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-100">
                Audit Meeting
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">
                Meeting Type
              </h1>
              <p className="mt-3 max-w-4xl text-base leading-7 text-slate-200">
                Create and maintain reusable meeting types for Meeting Master dropdown selection.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {meetingTypeActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {meetingTypeActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {meetingTypeActions.canImport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10">
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
          onRefresh={loadMeetingTypes}
          onReset={() => {
            setSearch("");
            setStatusFilter("active");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            resetToFirstPage();
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search meeting type name, description, status...",
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
                <th className="px-5 py-4">Meeting Type Name</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Active</th>
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
                      Loading Meeting Type records...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <Tags
                        size={42}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        No Meeting Type records found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => (
                    <tr key={item.meeting_type_id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 text-sm font-black text-slate-800">
                        #{item.meeting_type_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-800">
                          {item.meeting_type_name}
                        </div>
                      </td>
                      <td className="max-w-md px-5 py-4 text-sm text-slate-500">
                        {truncateText(item.description)}
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
                            {meetingTypeActions.canUpdate ? (
                              <button
                                onClick={() => openEditDrawer(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {item.is_active && meetingTypeActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(item, "inactive")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Mark as Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && meetingTypeActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && meetingTypeActions.canPermanentDelete ? (
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
        title="Meeting Type"
        description={
          drawerMode === "create"
            ? sessionCreatedCount > 0
              ? `Create — ${sessionCreatedCount} type${sessionCreatedCount === 1 ? "" : "s"} added in this session`
              : "Create"
            : "Edit"
        }
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
                  form="meeting-type-form"
                  disabled={submitLoading}
                  onClick={() => setSaveMode("close")}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading && saveMode === "close" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Tags className="h-4 w-4" />
                  )}
                  Save & Close
                </button>

                <button
                  type="submit"
                  form="meeting-type-form"
                  disabled={submitLoading}
                  onClick={() => setSaveMode("add_another")}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading && saveMode === "add_another" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Save & Add Another
                </button>
              </>
            ) : (
              <button
                type="submit"
                form="meeting-type-form"
                disabled={submitLoading}
                onClick={() => setSaveMode("close")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Tags className="h-4 w-4" />
                )}
                Update
              </button>
            )}
          </>
        }
      >
        <form
          id="meeting-type-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <CrudTextField
              label="Meeting Type Name"
              value={form.meeting_type_name}
              required
              placeholder="Example: Audit Planning"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  meeting_type_name: value,
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
          </div>

          <CrudTextAreaField
            label="Description"
            value={form.description}
            rows={5}
            placeholder="Write meeting type description..."
            onChange={(value) =>
              setForm((current) => ({ ...current, description: value }))
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
                  {confirmActionLabel[confirmAction]} Meeting Type
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to{" "}
                  <span className="font-black text-slate-700">
                    {confirmActionLabel[confirmAction]}
                  </span>{" "}
                  this Meeting Type record?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmItem.meeting_type_name}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={submitLoading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                {confirmButtonLabel[confirmAction]}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

