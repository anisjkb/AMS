"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CalendarDays,
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
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import { listAuditMaster, type AuditMaster } from "@/services/auditMaster";
import { listAuditTeams, type AuditTeam } from "@/services/auditTeam";
import { listAuditEntityAddresses, type AuditEntityAddress } from "@/services/auditEntityAddress";
import {
  createAuditVisitInfo,
  deactivateAuditVisitInfo,
  listAuditVisitInfo,
  permanentDeleteAuditVisitInfo,
  restoreAuditVisitInfo,
  updateAuditVisitInfo,
  type AuditVisitInfo,
  type AuditVisitInfoPayload,
} from "@/services/auditVisitInfo";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

const formatClientAddressOptionLabel = (address: AuditEntityAddress): string => {
  const parts = [
    address.address_line1,
    address.city,
    address.country,
  ].filter(Boolean);

  const label = parts.length > 0 ? parts.join(", ") : "Client Address";

  return `${label} (#${address.id})`;
};

type FormState = {
  audit_id: string;
  team_id: string;
  client_address_id: string;
  visit_date: string;
  status: string;
};

const emptyForm: FormState = {
  audit_id: "",
  team_id: "",
  client_address_id: "",
  visit_date: "",
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

function buildAuditMasterLabel(audit: AuditMaster) {
  const name = audit.audit_name || audit.audit_type;

  return `${name} - ${audit.audit_year} (#${audit.audit_id})`;
}

function buildFormFromItem(item: AuditVisitInfo): FormState {
  return {
    audit_id: String(item.audit_id),
    team_id: String(item.team_id),
    client_address_id: String(item.client_address_id),
    visit_date: item.visit_date,
    status: item.status,
  };
}

function buildPayload(form: FormState): AuditVisitInfoPayload {
  return {
    audit_id: Number.parseInt(form.audit_id, 10),
    team_id: Number.parseInt(form.team_id, 10),
    client_address_id: Number.parseInt(form.client_address_id, 10),
    visit_date: form.visit_date,
    status: form.status.trim(),
  };
}

export default function AuditVisitInfoPage() {
  const auditVisitInfoActions = useModuleActions("audit_visit_info");

  const [items, setItems] = useState<AuditVisitInfo[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [auditOptions, setAuditOptions] = useState<AuditMaster[]>([]);
  const [teamOptions, setTeamOptions] = useState<AuditTeam[]>([]);
  const [clientAddresses, setClientAddresses] = useState<AuditEntityAddress[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<AuditVisitInfo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<AuditVisitInfo | null>(null);
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

  const auditMap = useMemo(() => {
    return new Map(auditOptions.map((audit) => [audit.audit_id, audit]));
  }, [auditOptions]);

  const teamMap = useMemo(() => {
    return new Map(teamOptions.map((team) => [team.team_id, team]));
  }, [teamOptions]);

  const selectedAudit = useMemo(() => {
    if (!form.audit_id) return null;

    return auditMap.get(Number.parseInt(form.audit_id, 10)) ?? null;
  }, [auditMap, form.audit_id]);

  const selectedTeam = useMemo(() => {
    if (!form.team_id) return null;

    return teamMap.get(Number.parseInt(form.team_id, 10)) ?? null;
  }, [form.team_id, teamMap]);

  const clientAddressSelectOptions = useMemo(() => {
    if (!selectedAudit) {
      return [];
    }

    return clientAddresses
      .filter(
        (address) =>
          address.is_active === true &&
          Number(address.audit_entity_id) === Number(selectedAudit.client_id),
      )
      .map((address) => ({
        label: formatClientAddressOptionLabel(address),
        value: String(address.id),
      }));
  }, [clientAddresses, selectedAudit]);

  const showTopActions = auditVisitInfoActions.showTopActions;
  const showRowActions = auditVisitInfoActions.showRowActions;
  const tableColumnCount = showRowActions ? 9 : 8;

  const loadAuditVisitInfo = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditVisitInfo({
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
          : "Failed to load Audit Visit Info.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true);

    try {
      const [auditResponse, teamResponse, addressResponse] = await Promise.all([
        listAuditMaster({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        listAuditTeams({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
        listAuditEntityAddresses({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
      ]);

      setAuditOptions(auditResponse.items);
      setTeamOptions(teamResponse.items);
      setClientAddresses(addressResponse.items);
    } catch {
      setAuditOptions([]);
      setTeamOptions([]);
      setClientAddresses([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditVisitInfo();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditVisitInfo]);

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
    setForm(emptyForm);
    setDrawerOpen(true);
    void loadCatalogs();
  };

  const openEditDrawer = (item: AuditVisitInfo) => {
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

  const openConfirm = (item: AuditVisitInfo, action: ConfirmAction) => {
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
      setMessage({ type: "error", text: "Audit Master is required." });
      return false;
    }

    if (!form.team_id.trim()) {
      setMessage({ type: "error", text: "Audit Team is required." });
      return false;
    }

    if (!form.client_address_id.trim()) {
      setMessage({ type: "error", text: "Client Address is required." });
      return false;
    }

    if (Number.isNaN(Number.parseInt(form.client_address_id, 10))) {
      setMessage({ type: "error", text: "Client Address must be selected." });
      return false;
    }

    if (!form.visit_date.trim()) {
      setMessage({ type: "error", text: "Visit Date is required." });
      return false;
    }

    if (selectedAudit) {
      if (form.visit_date < selectedAudit.audit_start_date) {
        setMessage({
          type: "error",
          text: "Visit Date cannot be before Audit Start Date.",
        });
        return false;
      }

      if (form.visit_date > selectedAudit.audit_end_date) {
        setMessage({
          type: "error",
          text: "Visit Date cannot be after Audit End Date.",
        });
        return false;
      }
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
          ? "Audit Visit Info record created successfully."
          : "Audit Visit Info record updated successfully.";

      if (drawerMode === "create") {
        await createAuditVisitInfo(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditVisitInfo(selectedItem.visit_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditVisitInfo();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Audit Visit Info request failed.";

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
        await deactivateAuditVisitInfo(confirmItem.visit_id);
        setMessage({
          type: "success",
          text: "Audit Visit Info record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditVisitInfo(confirmItem.visit_id);
        setMessage({
          type: "success",
          text: "Audit Visit Info record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditVisitInfo(confirmItem.visit_id);
        setMessage({
          type: "success",
          text: "Audit Visit Info record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadAuditVisitInfo();
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
              <h1 className="mt-2 text-3xl font-black">Audit Visit Info</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Schedule audit visits by Audit Master, Audit Team and client address.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {auditVisitInfoActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {auditVisitInfoActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {auditVisitInfoActions.canImport ? (
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
          onRefresh={loadAuditVisitInfo}
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
              placeholder: "Search visit id, audit id, team id, date...",
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
                <th className="px-5 py-4">Visit ID</th>
                <th className="px-5 py-4">Audit Master</th>
                <th className="px-5 py-4">Audit Team</th>
                <th className="px-5 py-4">Client Address</th>
                <th className="px-5 py-4">Visit Date</th>
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
                      Loading Audit Visit Info...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <CalendarDays size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Audit Visit Info found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first audit visit schedule.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => {
                    const audit = auditMap.get(item.audit_id);
                    const team = teamMap.get(item.team_id);

                    return (
                      <tr key={item.visit_id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          #{item.visit_id}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {audit ? buildAuditMasterLabel(audit) : `Audit #${item.audit_id}`}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {team?.team_name ?? `Team #${item.team_id}`}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          Address #{item.client_address_id}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-700">
                          {formatDate(item.visit_date)}
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
                              {auditVisitInfoActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(item)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {item.is_active && auditVisitInfoActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(item, "delete")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!item.is_active && auditVisitInfoActions.canRestore ? (
                                <button
                                  onClick={() => openConfirm(item, "restore")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              auditVisitInfoActions.canPermanentDelete ? (
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
        title="Audit Visit Info"
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
              form="audit-visit-info-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="audit-visit-info-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Audit Master"
            value={form.audit_id}
            options={[
              {
                value: "",
                label: catalogLoading
                  ? "Loading Audit Master..."
                  : "Select Audit Master",
              },
              ...auditOptions.map((audit) => ({
                value: String(audit.audit_id),
                label: buildAuditMasterLabel(audit),
              })),
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                audit_id: value,
                      client_address_id: "",
                visit_date: "",
              }))
            }
          />

          {selectedAudit ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Audit Period: {formatDate(selectedAudit.audit_start_date)} to{" "}
              {formatDate(selectedAudit.audit_end_date)}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Audit Team"
              value={form.team_id}
              options={[
                {
                  value: "",
                  label: catalogLoading ? "Loading teams..." : "Select Audit Team",
                },
                ...teamOptions.map((team) => ({
                  value: String(team.team_id),
                  label: team.team_name,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({ ...current, team_id: value }))
              }
            />

            <CrudSelectField
              label="Client Address"
              value={form.client_address_id}
              required
              options={[
                {
                  label: form.audit_id
                    ? catalogLoading
                      ? "Loading Client Addresses..."
                      : "Select Client Address"
                    : "Select Audit Master first",
                  value: "",
                },
                ...clientAddressSelectOptions,
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  client_address_id: value,
                }))
              }
            />
          </div>

          {selectedTeam ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Selected Team: {selectedTeam.team_name}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <CrudDateField
              label="Visit Date"
              value={form.visit_date}
              required
              onChange={(value) =>
                setForm((current) => ({ ...current, visit_date: value }))
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
                  this Audit Visit Info?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  Visit #{confirmItem.visit_id} — {formatDate(confirmItem.visit_date)}
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
