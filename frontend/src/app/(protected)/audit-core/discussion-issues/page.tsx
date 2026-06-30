"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Loader2,
  MessagesSquare,
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
import { listAuditMaster } from "@/services/auditMaster";
import {
  createAuditDiscussionIssue,
  deactivateAuditDiscussionIssue,
  listAuditDiscussionIssues,
  permanentDeleteAuditDiscussionIssue,
  restoreAuditDiscussionIssue,
  updateAuditDiscussionIssue,
  type AuditDiscussionIssue,
  type AuditDiscussionIssuePayload,
} from "@/services/auditDiscussionIssue";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  audit_type: string;
  discussion_point: string;
  default_decision: string;
  status: string;
};

const emptyForm: FormState = {
  audit_type: "",
  discussion_point: "",
  default_decision: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
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

function truncateText(value: string, maxLength = 95) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength).trim()}...`;
}

function buildFormFromItem(item: AuditDiscussionIssue): FormState {
  return {
    audit_type: item.audit_type,
    discussion_point: item.discussion_point,
    default_decision: item.default_decision,
    status: item.status,
  };
}

function buildPayload(form: FormState): AuditDiscussionIssuePayload {
  return {
    audit_type: form.audit_type.trim(),
    discussion_point: form.discussion_point.trim(),
    default_decision: form.default_decision.trim(),
    status: form.status.trim(),
  };
}

export default function AuditDiscussionIssuesPage() {
  const discussionIssueActions = useModuleActions("audit_discussion_issue");

  const [items, setItems] = useState<AuditDiscussionIssue[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [auditTypeFilter, setAuditTypeFilter] = useState("all");

  const [auditTypeOptions, setAuditTypeOptions] = useState<string[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] =
    useState<AuditDiscussionIssue | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] =
    useState<AuditDiscussionIssue | null>(null);
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

  const selectedAuditTypeFilter = useMemo(() => {
    if (auditTypeFilter === "all") return undefined;

    return auditTypeFilter;
  }, [auditTypeFilter]);

  const showTopActions = discussionIssueActions.showTopActions;
  const showRowActions = discussionIssueActions.showRowActions;
  const tableColumnCount = showRowActions ? 8 : 7;

  const loadAuditDiscussionIssues = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditDiscussionIssues({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch,
        isActive: isActiveFilter,
        auditType: selectedAuditTypeFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load Audit Discussion Issues.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    isActiveFilter,
    numericPageSize,
    page,
    selectedAuditTypeFilter,
  ]);

  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const response = await listAuditMaster({
        page: 1,
        pageSize: 100,
        isActive: true,
      });

      const uniqueAuditTypes = Array.from(
        new Set(
          response.items
            .map((audit) => audit.audit_type)
            .filter((auditType) => auditType.trim().length > 0),
        ),
      ).sort((first, second) => first.localeCompare(second));

      setAuditTypeOptions(uniqueAuditTypes);
    } catch {
      setAuditTypeOptions([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditDiscussionIssues();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditDiscussionIssues]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadCatalogs();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadCatalogs]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm((current) => ({
      ...emptyForm,
      audit_type:
        auditTypeFilter !== "all"
          ? auditTypeFilter
          : auditTypeOptions[0] ?? current.audit_type,
    }));
    setDrawerOpen(true);
    void loadCatalogs();
  };

  const openEditDrawer = (item: AuditDiscussionIssue) => {
    setDrawerMode("edit");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
    void loadCatalogs();
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const openConfirm = (item: AuditDiscussionIssue, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.audit_type.trim()) {
      setMessage({ type: "error", text: "Audit Type is required." });
      return false;
    }

    if (!form.discussion_point.trim()) {
      setMessage({ type: "error", text: "Discussion Point is required." });
      return false;
    }

    if (!form.default_decision.trim()) {
      setMessage({ type: "error", text: "Default Decision is required." });
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
      const successText =
        drawerMode === "create"
          ? "Audit Discussion Issue record created successfully."
          : "Audit Discussion Issue record updated successfully.";

      if (drawerMode === "create") {
        await createAuditDiscussionIssue(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditDiscussionIssue(selectedItem.issue_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditDiscussionIssues();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Audit Discussion Issue request failed.";

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
        await deactivateAuditDiscussionIssue(confirmItem.issue_id);
        setMessage({
          type: "success",
          text: "Audit Discussion Issue record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditDiscussionIssue(confirmItem.issue_id);
        setMessage({
          type: "success",
          text: "Audit Discussion Issue record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditDiscussionIssue(confirmItem.issue_id);
        setMessage({
          type: "success",
          text: "Audit Discussion Issue record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadAuditDiscussionIssues();
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
                Audit Discussion Issues
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Maintain audit-type-wise discussion points and default decisions.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {discussionIssueActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {discussionIssueActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {discussionIssueActions.canImport ? (
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
          onRefresh={loadAuditDiscussionIssues}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setAuditTypeFilter("all");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            resetToFirstPage();
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search issue, audit type, decision...",
              onChange: (value) => {
                setSearch(value);
                resetToFirstPage();
              },
            },
            {
              key: "auditType",
              label: "Audit Type",
              type: "select",
              value: auditTypeFilter,
              options: [
                { value: "all", label: "All Audit Types" },
                ...auditTypeOptions.map((auditType) => ({
                  value: auditType,
                  label: auditType,
                })),
              ],
              onChange: (value) => {
                setAuditTypeFilter(value);
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
                <th className="px-5 py-4">Issue ID</th>
                <th className="px-5 py-4">Audit Type</th>
                <th className="px-5 py-4">Discussion Point</th>
                <th className="px-5 py-4">Default Decision</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
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
                      Loading Audit Discussion Issues...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <MessagesSquare
                        size={42}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Audit Discussion Issues found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first discussion issue master record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => (
                    <tr key={item.issue_id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        #{item.issue_id}
                      </td>
                      <td className="px-5 py-4">
                        <CrudPillBadge>{item.audit_type}</CrudPillBadge>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {item.discussion_point}
                      </td>
                      <td className="max-w-xl px-5 py-4 text-sm text-slate-500">
                        {truncateText(item.default_decision)}
                      </td>
                      <td className="px-5 py-4">
                        <CrudPillBadge>{toTitle(item.status)}</CrudPillBadge>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <CrudStatusBadge active={item.is_active} />
                      </td>

                      {showRowActions ? (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {discussionIssueActions.canUpdate ? (
                              <button
                                onClick={() => openEditDrawer(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {item.is_active && discussionIssueActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(item, "delete")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            discussionIssueActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            discussionIssueActions.canPermanentDelete ? (
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
        title="Audit Discussion Issue"
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
              form="audit-discussion-issue-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessagesSquare className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="audit-discussion-issue-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Audit Type"
            value={form.audit_type}
            options={[
              {
                value: "",
                label: catalogLoading ? "Loading Audit Types..." : "Select Audit Type",
              },
              ...auditTypeOptions.map((auditType) => ({
                value: auditType,
                label: auditType,
              })),
            ]}
            onChange={(value) =>
              setForm((current) => ({ ...current, audit_type: value }))
            }
          />

          <CrudTextField
            label="Discussion Point"
            value={form.discussion_point}
            required
            placeholder="Example: Review compliance documents"
            onChange={(value) =>
              setForm((current) => ({ ...current, discussion_point: value }))
            }
          />

          <CrudTextAreaField
            label="Default Decision"
            value={form.default_decision}
            required
            placeholder="Write default decision or standard audit discussion outcome..."
            onChange={(value) =>
              setForm((current) => ({ ...current, default_decision: value }))
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
                  this Audit Discussion Issue?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  #{confirmItem.issue_id} — {confirmItem.discussion_point}
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
