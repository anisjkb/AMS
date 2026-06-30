"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ClipboardList,
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
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import { listAuditEntities, type AuditEntity } from "@/services/auditEntity";
import {
  createAuditMaster,
  deactivateAuditMaster,
  listAuditMaster,
  permanentDeleteAuditMaster,
  restoreAuditMaster,
  updateAuditMaster,
  type AuditMaster,
  type AuditMasterPayload,
} from "@/services/auditMaster";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  entity_type: string;
  client_id: string;
  audit_type: string;
  audit_year: string;
  audit_start_date: string;
  audit_end_date: string;
  audit_note: string;
  status: string;
  audit_name: string;
};

const emptyForm: FormState = {
  entity_type: "",
  client_id: "",
  audit_type: "",
  audit_year: "",
  audit_start_date: "",
  audit_end_date: "",
  audit_note: "",
  status: "active",
  audit_name: "",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "inactive", label: "Inactive" },
];

const auditTypeOptions = [
  { value: "Compliance Audit", label: "Compliance Audit" },
  { value: "Financial Audit", label: "Financial Audit" },
  { value: "Operational Audit", label: "Operational Audit" },
  { value: "Management Audit", label: "Management Audit" },
  { value: "Internal Audit", label: "Internal Audit" },
  { value: "IT Audit", label: "IT Audit" },
  { value: "Special Audit", label: "Special Audit" },
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

function buildClientLabel(entity: AuditEntity) {
  return `${entity.entity_name} (${entity.entity_code})`;
}

function buildFormFromItem(item: AuditMaster): FormState {
  return {
    entity_type: "",
    client_id: String(item.client_id),
    audit_type: item.audit_type,
    audit_year: item.audit_year,
    audit_start_date: item.audit_start_date,
    audit_end_date: item.audit_end_date,
    audit_note: item.audit_note,
    status: item.status,
    audit_name: item.audit_name ?? "",
  };
}

function buildPayload(form: FormState): AuditMasterPayload {
  return {
    client_id: Number.parseInt(form.client_id, 10),
    audit_type: form.audit_type.trim(),
    audit_year: form.audit_year.trim(),
    audit_start_date: form.audit_start_date,
    audit_end_date: form.audit_end_date,
    audit_note: form.audit_note.trim(),
    status: form.status.trim(),
    audit_name: form.audit_name.trim() || null,
  };
}

export default function AuditMasterPage() {
  const auditMasterActions = useModuleActions("audit_master");

  const [items, setItems] = useState<AuditMaster[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [entityOptions, setEntityOptions] = useState<AuditEntity[]>([]);
  const [entityLoading, setEntityLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedItem, setSelectedItem] = useState<AuditMaster | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmItem, setConfirmItem] = useState<AuditMaster | null>(null);
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

  const entityTypeOptions = useMemo(() => {
    return Array.from(
      new Set(
        entityOptions
          .map((entity) => entity.entity_type)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [entityOptions]);

  const filteredClientOptions = useMemo(() => {
    if (!form.entity_type) return [];

    return entityOptions.filter(
      (entity) => entity.entity_type === form.entity_type,
    );
  }, [entityOptions, form.entity_type]);

  const selectedClient = useMemo(() => {
    if (!form.client_id) return null;

    return (
      entityOptions.find((entity) => String(entity.id) === form.client_id) ?? null
    );
  }, [entityOptions, form.client_id]);

  const showTopActions = auditMasterActions.showTopActions;
  const showRowActions = auditMasterActions.showRowActions;
  const tableColumnCount = showRowActions ? 9 : 8;

  const loadAuditMaster = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await listAuditMaster({
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
          : "Failed to load Audit Master records.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, isActiveFilter, numericPageSize, page]);

  const loadEntityCatalog = useCallback(async () => {
    setEntityLoading(true);

    try {
      const response = await listAuditEntities({
        page: 1,
        pageSize: 100,
        isActive: true,
        sortBy: "entity_name",
        sortOrder: "asc",
      });

      setEntityOptions(response.items);
    } catch {
      setEntityOptions([]);
    } finally {
      setEntityLoading(false);
    }
  }, []);

  const hydrateSelectedClientForEdit = useCallback(async (item: AuditMaster) => {
    try {
      const response = await listAuditEntities({
        page: 1,
        pageSize: 100,
        isActive: true,
        sortBy: "entity_name",
        sortOrder: "asc",
      });

      setEntityOptions(response.items);

      const selectedEntity = response.items.find(
        (entity) => entity.id === item.client_id,
      );

      if (!selectedEntity) return;

      setForm((current) => ({
        ...current,
        entity_type: selectedEntity.entity_type,
        client_id: String(selectedEntity.id),
      }));
    } catch {
      setForm((current) => ({
        ...current,
        entity_type: "",
        client_id: String(item.client_id),
      }));
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadAuditMaster();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadAuditMaster]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadEntityCatalog();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadEntityCatalog]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setForm(emptyForm);
    setDrawerOpen(true);
    void loadEntityCatalog();
  };

  const openEditDrawer = (item: AuditMaster) => {
    setDrawerMode("edit");
    setSelectedItem(item);
    setForm(buildFormFromItem(item));
    setDrawerOpen(true);
    void hydrateSelectedClientForEdit(item);
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const openConfirm = (item: AuditMaster, action: ConfirmAction) => {
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
      ["entity_type", "Entity Type is required."],
      ["client_id", "Client / Entity is required."],
      ["audit_type", "Audit Type is required."],
      ["audit_year", "Audit Year is required."],
      ["audit_start_date", "Audit Start Date is required."],
      ["audit_end_date", "Audit End Date is required."],
      ["audit_note", "Audit Note is required."],
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
      setMessage({
        type: "error",
        text: "Client / Entity must be a valid selection.",
      });
      return false;
    }

    if (new Date(form.audit_end_date) < new Date(form.audit_start_date)) {
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
          ? "Audit Master record created successfully."
          : "Audit Master record updated successfully.";

      if (drawerMode === "create") {
        await createAuditMaster(buildPayload(form));
      } else if (selectedItem) {
        await updateAuditMaster(selectedItem.audit_id, buildPayload(form));
      }

      setDrawerOpen(false);
      setSelectedItem(null);
      setForm(emptyForm);

      await loadAuditMaster();

      setMessage({ type: "success", text: successText });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Audit Master request failed.";

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
        await deactivateAuditMaster(confirmItem.audit_id);
        setMessage({
          type: "success",
          text: "Audit Master record deactivated successfully.",
        });
      }

      if (confirmAction === "restore") {
        await restoreAuditMaster(confirmItem.audit_id);
        setMessage({
          type: "success",
          text: "Audit Master record restored successfully.",
        });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditMaster(confirmItem.audit_id);
        setMessage({
          type: "success",
          text: "Audit Master record permanently deleted successfully.",
        });
      }

      setConfirmItem(null);
      setConfirmAction(null);
      await loadAuditMaster();
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
              <h1 className="mt-2 text-3xl font-black">Audit Master</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Create and maintain audit master records linked with active
                Audit Entities.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {auditMasterActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {auditMasterActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {auditMasterActions.canImport ? (
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
          onRefresh={loadAuditMaster}
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
              placeholder: "Search audit name, type, year, note...",
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
                <th className="px-5 py-4">Audit ID</th>
                <th className="px-5 py-4">Audit Name</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Audit Type</th>
                <th className="px-5 py-4">Audit Year</th>
                <th className="px-5 py-4">Period</th>
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
                      Loading Audit Master records...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <ClipboardList size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No Audit Master records found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create the first audit master record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((item) => {
                    const client = entityMap.get(item.client_id);

                    return (
                      <tr key={item.audit_id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          #{item.audit_id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-black text-slate-800">
                            {item.audit_name || "-"}
                          </div>
                          <div className="mt-1 line-clamp-1 text-xs text-slate-400">
                            {item.audit_note}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {client ? buildClientLabel(client) : `Client #${item.client_id}`}
                        </td>
                        <td className="px-5 py-4">
                          <CrudPillBadge>{item.audit_type}</CrudPillBadge>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {item.audit_year}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(item.audit_start_date)} —{" "}
                          {formatDate(item.audit_end_date)}
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
                              {auditMasterActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(item)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {item.is_active && auditMasterActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(item, "delete")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!item.is_active && auditMasterActions.canRestore ? (
                                <button
                                  onClick={() => openConfirm(item, "restore")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!item.is_active &&
                              auditMasterActions.canPermanentDelete ? (
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
        title="Audit Master"
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
              form="audit-master-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="audit-master-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Entity Type"
              value={form.entity_type}
              options={[
                { value: "", label: "Select Entity Type" },
                ...entityTypeOptions.map((type) => ({
                  value: type,
                  label: toTitle(type),
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  entity_type: value,
                  client_id: "",
                }))
              }
            />

            <CrudSelectField
              label="Client / Entity"
              value={form.client_id}
              options={[
                {
                  value: "",
                  label: entityLoading
                    ? "Loading entities..."
                    : form.entity_type
                      ? "Select Client / Entity"
                      : "Select Entity Type First",
                },
                ...filteredClientOptions.map((entity) => ({
                  value: String(entity.id),
                  label: buildClientLabel(entity),
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({ ...current, client_id: value }))
              }
            />
          </div>

          {selectedClient ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Selected Client: {buildClientLabel(selectedClient)}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Audit Type"
              value={form.audit_type}
              options={[
                { value: "", label: "Select Audit Type" },
                ...auditTypeOptions,
              ]}
              onChange={(value) =>
                setForm((current) => ({ ...current, audit_type: value }))
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

          <CrudTextField
            label="Audit Name"
            value={form.audit_name}
            placeholder="Example: 2026 Compliance Audit"
            onChange={(value) =>
              setForm((current) => ({ ...current, audit_name: value }))
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
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

          <CrudSelectField
            label="Status"
            value={form.status}
            options={statusOptions}
            onChange={(value) =>
              setForm((current) => ({ ...current, status: value }))
            }
          />

          <CrudTextAreaField
            label="Audit Note"
            value={form.audit_note}
            required
            placeholder="Write audit note..."
            rows={4}
            onChange={(value) =>
              setForm((current) => ({ ...current, audit_note: value }))
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
                  this Audit Master record?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmItem.audit_name || confirmItem.audit_type}
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
