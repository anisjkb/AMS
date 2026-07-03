"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Loader2,
  MessageSquareText,
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
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import { listAuditMaster, type AuditMaster } from "@/services/auditMaster";
import {
  createGeneralDiscussion,
  deactivateGeneralDiscussion,
  listGeneralDiscussions,
  permanentDeleteGeneralDiscussion,
  restoreGeneralDiscussion,
  updateGeneralDiscussion,
  type GeneralDiscussion,
  type GeneralDiscussionPayload,
} from "@/services/generalDiscussion";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type SaveMode = "add_another" | "close";

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

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  audit_id: string;
  title: string;
  description: string;
  status: string;
};

const emptyForm: FormState = {
  audit_id: "",
  title: "",
  description: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "closed", label: "Closed" },
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

function truncateText(value: string | null | undefined, maxLength = 95) {
  if (!value) return "-";
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength).trim()}...`;
}

function readTextField(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function buildAuditLabel(audit: AuditMaster) {
  const record = audit as unknown as Record<string, unknown>;
  const auditId = readTextField(record, ["audit_id", "id"]);
  const auditCode = readTextField(record, ["audit_code", "code"]);
  const auditTitle = readTextField(record, [
    "audit_title",
    "title",
    "audit_name",
    "name",
    "audit_type",
  ]);

  return [auditId ? `Audit #${auditId}` : "", auditCode, auditTitle]
    .filter(Boolean)
    .join(" - ");
}

function buildFormFromItem(item: GeneralDiscussion): FormState {
  return {
    audit_id: String(item.audit_id),
    title: item.title,
    description: item.description ?? "",
    status: item.status,
  };
}

function buildPayload(form: FormState): GeneralDiscussionPayload {
  return {
    audit_id: Number.parseInt(form.audit_id, 10),
    title: form.title.trim(),
    description: form.description.trim() || null,
    status: form.status.trim(),
  };
}

export default function GeneralDiscussionIssuePage() {
  const generalDiscussionActions = useModuleActions("general_discussion");

  const [items, setItems] = useState<GeneralDiscussion[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [auditOptions, setAuditOptions] = useState<AuditMaster[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);
  const [saveMode, setSaveMode] = useState<SaveMode>("add_another");
  const [sessionCreatedCount, setSessionCreatedCount] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<GeneralDiscussion | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<GeneralDiscussion | null>(null);
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

  const auditMap = useMemo(() => {
    return new Map(
      auditOptions.map((audit) => [
        String((audit as unknown as Record<string, unknown>).audit_id),
        audit,
      ]),
    );
  }, [auditOptions]);

  const showTopActions = generalDiscussionActions.showTopActions;
  const showRowActions = generalDiscussionActions.showRowActions;
  const tableColumnCount = showRowActions ? 8 : 7;

  const loadGeneralDiscussions = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listGeneralDiscussions({
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
          : "Failed to load General Discussion Issue records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadAuditOptions = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const response = await listAuditMaster({
        page: 1,
        pageSize: 100,
        isActive: true,
      });

      setAuditOptions(response.items);
    } catch {
      setAuditOptions([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadGeneralDiscussions();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadGeneralDiscussions]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditOptions();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditOptions]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const focusTitleField = () => {
    window.setTimeout(() => {
      const titleInput = formRef.current?.querySelector<HTMLInputElement>(
        'input[placeholder="Write discussion issue title"]',
      );

      titleInput?.focus();
      titleInput?.select();
    }, 80);
  };

  const openCreateDrawer = () => {
    const firstAudit =
      auditOptions[0] as unknown as Record<string, unknown> | undefined;

    setDrawerMode("create");
    setSaveMode("add_another");
    setSessionCreatedCount(0);
    setSelectedItem(null);
    setForm({
      ...emptyForm,
      audit_id: firstAudit?.audit_id ? String(firstAudit.audit_id) : "",
    });
    setDrawerOpen(true);
    void loadAuditOptions();
    focusTitleField();
  };

  const openEditDrawer = (item: GeneralDiscussion) => {
    setDrawerMode("edit");
    setSaveMode("close");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
    void loadAuditOptions();
    focusTitleField();
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const openConfirm = (item: GeneralDiscussion, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.audit_id.trim()) {
      setMessage({
        type: "error",
        text: "Please select a system-generated Audit Master record.",
      });
      return false;
    }

    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
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
        await createGeneralDiscussion(buildPayload(form));
        await loadGeneralDiscussions();

        setSessionCreatedCount((current) => current + 1);

        if (saveMode === "add_another") {
          setForm((current) => ({
            ...emptyForm,
            audit_id: current.audit_id,
            status: current.status || "active",
          }));

          setMessage({
            type: "success",
            text: "General Discussion Issue record saved. Add another issue below.",
          });

          focusTitleField();

          return;
        }

        setDrawerOpen(false);
        setSelectedItem(null);
        setForm(emptyForm);

        setMessage({
          type: "success",
          text: "General Discussion Issue record created successfully.",
        });

        return;
      }

      if (selectedItem) {
        await updateGeneralDiscussion(selectedItem.id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadGeneralDiscussions();

      setMessage({
        type: "success",
        text: "General Discussion Issue record updated successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "General Discussion Issue request failed.";

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
        await deactivateGeneralDiscussion(confirmItem.id);
        setMessage({
          type: "success",
          text: "General Discussion Issue record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreGeneralDiscussion(confirmItem.id);
        setMessage({
          type: "success",
          text: "General Discussion Issue record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteGeneralDiscussion(confirmItem.id);
        setMessage({
          type: "success",
          text: "General Discussion Issue record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadGeneralDiscussions();
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
                Audit Core
              </p>
              <h1 className="mt-2 text-3xl font-black">
                General Discussion Issue
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Manage general audit discussion issue records with system-generated audit references.
              </p>
            </div>

            {showTopActions && generalDiscussionActions.canCreate ? (
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
          onRefresh={loadGeneralDiscussions}
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
              placeholder: "Search title or description...",
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
                <th className="px-5 py-4">System Audit</th>
                <th className="px-5 py-4">Title</th>
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
                      Loading General Discussion Issue records...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <MessageSquareText
                        size={42}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No General Discussion Issue records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first general discussion issue record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => {
                    const audit = auditMap.get(String(item.audit_id));

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          #{item.id}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {audit ? buildAuditLabel(audit) : `Audit #${item.audit_id}`}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-800">
                          {item.title}
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
                              {generalDiscussionActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(item)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {item.is_active && generalDiscussionActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(item, "inactive")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!item.is_active && generalDiscussionActions.canRestore ? (
                                <button
                                  onClick={() => openConfirm(item, "restore")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              generalDiscussionActions.canPermanentDelete ? (
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
                    );
                  })
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
        title="General Discussion Issue"
        description={
          drawerMode === "create"
            ? sessionCreatedCount > 0
              ? `Create — ${sessionCreatedCount} issue${sessionCreatedCount === 1 ? "" : "s"} added in this session`
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
                  form="general-discussion-issue-form"
                  disabled={submitLoading}
                  onClick={() => setSaveMode("close")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading && saveMode === "close" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Save & Close
                </button>

                <button
                  type="submit"
                  form="general-discussion-issue-form"
                  disabled={submitLoading}
                  onClick={() => setSaveMode("add_another")}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading && saveMode === "add_another" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquareText className="h-4 w-4" />
                  )}
                  Save & Add Another
                </button>
              </>
            ) : (
              <button
                type="submit"
                form="general-discussion-issue-form"
                disabled={submitLoading}
                onClick={() => setSaveMode("close")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareText className="h-4 w-4" />
                )}
                Update
              </button>
            )}
          </>
        }
      >
        <form
          ref={formRef}
          id="general-discussion-issue-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="System Audit"
            value={form.audit_id}
            options={[
              {
                value: "",
                label: catalogLoading
                  ? "Loading system audit records..."
                  : "Select system-generated audit record",
              },
              ...auditOptions.map((audit) => {
                const record = audit as unknown as Record<string, unknown>;

                return {
                  value: String(record.audit_id),
                  label: buildAuditLabel(audit),
                };
              }),
            ]}
            onChange={(value) =>
              setForm((current) => ({ ...current, audit_id: value }))
            }
          />

          <CrudTextField
            label="Title"
            value={form.title}
            required
            placeholder="Write discussion issue title"
            onChange={(value) =>
              setForm((current) => ({ ...current, title: value }))
            }
          />

          <CrudTextAreaField
            label="Description"
            value={form.description}
            placeholder="Write discussion issue description..."
            onChange={(value) =>
              setForm((current) => ({ ...current, description: value }))
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
                  this General Discussion Issue?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  #{confirmItem.id} — {confirmItem.title}
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




