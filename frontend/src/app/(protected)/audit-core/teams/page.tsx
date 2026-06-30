"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Users,
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
  createAuditTeam,
  deactivateAuditTeam,
  listAuditTeams,
  permanentDeleteAuditTeam,
  restoreAuditTeam,
  updateAuditTeam,
  type AuditTeam,
  type AuditTeamPayload,
} from "@/services/auditTeam";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  team_name: string;
  team_note: string;
  status: string;
};

const emptyForm: FormState = {
  team_name: "",
  team_note: "",
  status: "active",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
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

function buildFormFromItem(item: AuditTeam): FormState {
  return {
    team_name: item.team_name,
    team_note: item.team_note ?? "",
    status: item.status,
  };
}

function buildPayload(form: FormState): AuditTeamPayload {
  return {
    team_name: form.team_name.trim(),
    team_note: form.team_note.trim() || null,
    status: form.status.trim(),
  };
}

export default function AuditTeamsPage() {
  const auditTeamActions = useModuleActions("audit_team");

  const [items, setItems] = useState<AuditTeam[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<AuditTeam | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<AuditTeam | null>(null);
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

  const showTopActions = auditTeamActions.showTopActions;
  const showRowActions = auditTeamActions.showRowActions;
  const tableColumnCount = showRowActions ? 7 : 6;

  const loadAuditTeams = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditTeams({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch,
        isActive: isActiveFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load Audit Teams.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditTeams();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditTeams]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: AuditTeam) => {
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

  const openConfirm = (item: AuditTeam, action: ConfirmAction) => {
    setConfirmItem(item);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmItem(null);
    setConfirmAction(null);
  };

  const validateForm = () => {
    if (!form.team_name.trim()) {
      setMessage({ type: "error", text: "Team Name is required." });
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
          ? "Audit Team record created successfully."
          : "Audit Team record updated successfully.";

      if (drawerMode === "create") {
        await createAuditTeam(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditTeam(selectedItem.team_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditTeams();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Audit Team request failed.";

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
        await deactivateAuditTeam(confirmItem.team_id);
        setMessage({
          type: "success",
          text: "Audit Team record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditTeam(confirmItem.team_id);
        setMessage({
          type: "success",
          text: "Audit Team record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditTeam(confirmItem.team_id);
        setMessage({
          type: "success",
          text: "Audit Team record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadAuditTeams();
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
              <h1 className="mt-2 text-3xl font-black">Audit Teams</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Create and maintain audit teams before assigning team members.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {auditTeamActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {auditTeamActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {auditTeamActions.canImport ? (
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
          onRefresh={loadAuditTeams}
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
              placeholder: "Search team name, note, status...",
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
                <th className="px-5 py-4">Team ID</th>
                <th className="px-5 py-4">Team Name</th>
                <th className="px-5 py-4">Note</th>
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
                      Loading Audit Teams...
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
                        No Audit Teams found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first audit team.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => (
                    <tr key={item.team_id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-black text-slate-900">
                        #{item.team_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-black text-slate-800">
                          {item.team_name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="line-clamp-2 max-w-md text-sm text-slate-500">
                          {item.team_note || "-"}
                        </div>
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
                            {auditTeamActions.canUpdate ? (
                              <button
                                onClick={() => openEditDrawer(item)}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}

                            {item.is_active && auditTeamActions.canDelete ? (
                              <button
                                onClick={() => openConfirm(item, "delete")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                title="Inactive"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}

                            {!item.is_active && auditTeamActions.canRestore ? (
                              <button
                                onClick={() => openConfirm(item, "restore")}
                                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                            ) : null}

                            {!item.is_active &&
                            auditTeamActions.canPermanentDelete ? (
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
        title="Audit Team"
        description={drawerMode === "create" ? "Create" : "Edit"}
        maxWidthClassName="max-w-2xl"
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
              form="audit-team-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form id="audit-team-form" onSubmit={handleSubmit} className="space-y-5">
          <CrudTextField
            label="Team Name"
            value={form.team_name}
            required
            placeholder="Example: Field Audit Team A"
            onChange={(value) =>
              setForm((current) => ({ ...current, team_name: value }))
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

          <CrudTextAreaField
            label="Team Note"
            value={form.team_note}
            placeholder="Write team note..."
            rows={4}
            onChange={(value) =>
              setForm((current) => ({ ...current, team_note: value }))
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
                  this Audit Team?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmItem.team_name}
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
