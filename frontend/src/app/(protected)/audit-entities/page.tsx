"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  GitFork,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudCheckboxField from "@/components/crud/fields/CrudCheckboxField";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import {
  createAuditEntity,
  deactivateAuditEntity,
  listAuditEntities,
  permanentDeleteAuditEntity,
  restoreAuditEntity,
  updateAuditEntity,
  type AuditEntity,
  type AuditEntityPayload,
} from "@/services/auditEntity";
import { listLegalStatuses, type LegalStatus } from "@/services/legalStatus";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type FormState = {
  parent_entity_id: string;
  entity_code: string;
  entity_name: string;
  entity_type: string;
  entity_class: string;
  legal_status_id: string;
  registration_no: string;
  tax_identification_no: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  country: string;
  risk_rating: string;
  is_internal: boolean;
  is_confidential: boolean;
  description: string;
  remarks: string;
};

const entityTypes = [
  "client",
  "internal_unit",
  "vendor",
  "partner",
  "project_owner",
  "other",
];

const entityClasses = [
  "group",
  "company",
  "branch",
  "division",
  "business_unit",
  "project",
];

const riskRatings = ["low", "medium", "high", "critical"];

const initialForm: FormState = {
  parent_entity_id: "",
  entity_code: "",
  entity_name: "",
  entity_type: "client",
  entity_class: "company",
  legal_status_id: "",
  registration_no: "",
  tax_identification_no: "",
  contact_person: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  city: "",
  country: "Bangladesh",
  risk_rating: "",
  is_internal: false,
  is_confidential: false,
  description: "",
  remarks: "",
};

function cleanText(value: string) {
  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function toOptionalNumber(value: string) {
  if (!value) return null;

  return Number(value);
}

function toTitle(value: string | null) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRiskBadgeClass(value: string | null) {
  if (value === "low") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "high") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (value === "critical") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function toFormState(entity: AuditEntity): FormState {
  return {
    parent_entity_id:
      entity.parent_entity_id === null ? "" : String(entity.parent_entity_id),
    entity_code: entity.entity_code,
    entity_name: entity.entity_name,
    entity_type: entity.entity_type,
    entity_class: entity.entity_class,
    legal_status_id:
      entity.legal_status_id === null ? "" : String(entity.legal_status_id),
    registration_no: entity.registration_no ?? "",
    tax_identification_no: entity.tax_identification_no ?? "",
    contact_person: entity.contact_person ?? "",
    contact_email: entity.contact_email ?? "",
    contact_phone: entity.contact_phone ?? "",
    address: entity.address ?? "",
    city: entity.city ?? "",
    country: entity.country ?? "",
    risk_rating: entity.risk_rating ?? "",
    is_internal: entity.is_internal,
    is_confidential: entity.is_confidential,
    description: entity.description ?? "",
    remarks: entity.remarks ?? "",
  };
}

export default function AuditEntitiesPage() {
  const actions = useModuleActions("audit_entity");

  const [entities, setEntities] = useState<AuditEntity[]>([]);
  const [parentEntities, setParentEntities] = useState<AuditEntity[]>([]);
  const [legalStatuses, setLegalStatuses] = useState<LegalStatus[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [entityClassFilter, setEntityClassFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedEntity, setSelectedEntity] = useState<AuditEntity | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AuditEntity | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

  const legalStatusById = useMemo(() => {
    return new Map(legalStatuses.map((status) => [status.id, status]));
  }, [legalStatuses]);

  const parentById = useMemo(() => {
    return new Map(parentEntities.map((entity) => [entity.id, entity]));
  }, [parentEntities]);

  const totalPages = useMemo(() => {
    if (totalRecords === 0) return 1;

    return Math.max(1, Math.ceil(totalRecords / numericPageSize));
  }, [numericPageSize, totalRecords]);


  const isReadOnly = !actions.canCreate && !actions.canUpdate;

  const loadMasterData = useCallback(async () => {
    setIsMasterLoading(true);

    try {
      const [parents, legalStatusResponse] = await Promise.all([
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "entity_name",
          sortOrder: "asc",
        }),
        listLegalStatuses({
          page: 1,
          pageSize: 100,
          isActive: true,
        }),
      ]);

      setParentEntities(parents.items);
      setLegalStatuses(legalStatusResponse.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load master data.",
      );
    } finally {
      setIsMasterLoading(false);
    }
  }, []);

  const loadEntities = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntities({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        entityType: entityTypeFilter || undefined,
        entityClass: entityClassFilter || undefined,
        parentEntityId: parentFilter ? Number(parentFilter) : undefined,
        sortBy: "id",
        sortOrder: "desc",
      });

      setEntities(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load audit entities.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    entityClassFilter,
    entityTypeFilter,
    numericPageSize,
    page,
    parentFilter,
    statusFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMasterData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadMasterData]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadEntities();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadEntities]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedEntity(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (entity: AuditEntity) => {
    setDrawerMode("edit");
    setSelectedEntity(entity);
    setForm(toFormState(entity));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setIsDrawerOpen(false);
    setSelectedEntity(null);
    setForm(initialForm);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value as CrudPageSizeOption);
    setPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEntityTypeFilterChange = (value: string) => {
    setEntityTypeFilter(value);
    setPage(1);
  };

  const handleEntityClassFilterChange = (value: string) => {
    setEntityClassFilter(value);
    setPage(1);
  };

  const handleParentFilterChange = (value: string) => {
    setParentFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const buildPayload = (): AuditEntityPayload => {
    return {
      parent_entity_id: toOptionalNumber(form.parent_entity_id),
      entity_code: cleanText(form.entity_code),
      entity_name: form.entity_name.trim(),
      entity_type: form.entity_type,
      entity_class: form.entity_class,
      legal_status_id: toOptionalNumber(form.legal_status_id),
      registration_no: cleanText(form.registration_no),
      tax_identification_no: cleanText(form.tax_identification_no),
      contact_person: cleanText(form.contact_person),
      contact_email: cleanText(form.contact_email),
      contact_phone: cleanText(form.contact_phone),
      address: cleanText(form.address),
      city: cleanText(form.city),
      country: cleanText(form.country),
      risk_rating: cleanText(form.risk_rating),
      is_internal: form.is_internal,
      is_confidential: form.is_confidential,
      description: cleanText(form.description),
      remarks: cleanText(form.remarks),
    };
  };

  const validateForm = () => {
    if (!form.entity_name.trim()) {
      return "Entity name is required.";
    }

    if (!form.entity_type.trim()) {
      return "Entity type is required.";
    }

    if (!form.entity_class.trim()) {
      return "Entity class is required.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (drawerMode === "create") {
        await createAuditEntity(buildPayload());
        setSuccessMessage("Audit entity created successfully.");
      } else if (selectedEntity) {
        await updateAuditEntity(selectedEntity.id, buildPayload());
        setSuccessMessage("Audit entity updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedEntity(null);
      setForm(initialForm);

      await loadEntities();
      await loadMasterData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save audit entity.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (entity: AuditEntity, action: ConfirmAction) => {
    setConfirmTarget(entity);
    setConfirmAction(action);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
    setConfirmAction(null);
  };

  const executeConfirmAction = async () => {
    if (!confirmTarget || !confirmAction) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (confirmAction === "delete") {
        await deactivateAuditEntity(confirmTarget.id);
        setSuccessMessage("Audit entity deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntity(confirmTarget.id);
        setSuccessMessage("Audit entity restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntity(confirmTarget.id);
        setSuccessMessage("Audit entity permanently deleted successfully.");
      }

      closeConfirm();
      await loadEntities();
      await loadMasterData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to complete action.",
      );
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                <Building2 className="h-4 w-4" />
                Audit Foundation
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                Audit Entities
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Maintain auditee/client core identity, hierarchy and legal
                profile. Business activities are managed separately.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add Entity
              </button>
            ) : null}
          </div>
        </div>

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={loadEntities}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setEntityTypeFilter("");
            setEntityClassFilter("");
            setParentFilter("");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            setPage(1);
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search code, name, TIN, contact, city...",
              onChange: handleSearchChange,
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
              onChange: (value) =>
                handleStatusFilterChange(value as StatusFilter),
            },
            {
              key: "type",
              label: "Type",
              type: "select",
              value: entityTypeFilter,
              options: [
                { value: "", label: "All" },
                ...entityTypes.map((type) => ({
                  value: type,
                  label: toTitle(type),
                })),
              ],
              onChange: handleEntityTypeFilterChange,
            },
            {
              key: "class",
              label: "Class",
              type: "select",
              value: entityClassFilter,
              options: [
                { value: "", label: "All" },
                ...entityClasses.map((item) => ({
                  value: item,
                  label: toTitle(item),
                })),
              ],
              onChange: handleEntityClassFilterChange,
            },
            {
              key: "parent",
              label: "Parent",
              type: "select",
              value: parentFilter,
              disabled: isMasterLoading,
              options: [
                { value: "", label: "All" },
                ...parentEntities.map((entity) => ({
                  value: String(entity.id),
                  label: entity.entity_name,
                })),
              ],
              onChange: handleParentFilterChange,
            },
          ]}
        />

        {(successMessage || (errorMessage && !isDrawerOpen)) ? (
          <div className="border-b border-slate-200 px-6 py-4">
            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage && !isDrawerOpen ? (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Type / Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Legal
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading audit entities...
                    </div>
                  </td>
                </tr>
              ) : entities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No audit entities found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create your first audit entity profile.
                    </p>
                  </td>
                </tr>
              ) : (
                entities.map((entity) => {
                  const parent = entity.parent_entity_id
                    ? parentById.get(entity.parent_entity_id)
                    : null;
                  const legalName =
                    entity.legal_status_id === null
                      ? entity.legal_status ?? "-"
                      : legalStatusById.get(entity.legal_status_id)
                          ?.legal_status_name ??
                        entity.legal_status ??
                        "-";
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    entity.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !entity.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !entity.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={entity.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity.entity_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity.entity_code}
                        </div>
                        {parent ? (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                            <GitFork className="h-3 w-3" />
                            {parent.entity_name}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {toTitle(entity.entity_type)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {toTitle(entity.entity_class)}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {legalName}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Reg: {entity.registration_no ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          TIN: {entity.tax_identification_no ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {entity.contact_person ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity.contact_email ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity.contact_phone ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRiskBadgeClass(
                            entity.risk_rating,
                          )}`}
                        >
                          {toTitle(entity.risk_rating)}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            entity.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {entity.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(entity)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(entity, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(entity, "restore")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canPermanentDelete ? (
                            <button
                              type="button"
                              onClick={() =>
                                openConfirm(entity, "permanent_delete")
                              }
                              className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                              title="Permanent delete"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <CrudPagination
          page={page}
          totalPages={totalPages}
          total={totalRecords}
          pageSize={numericPageSize}
          onPageChange={setPage}
        />
      </section>

      <CrudDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={drawerMode === "create" ? "Create Audit Entity" : "Edit Audit Entity"}
        description="Core entity identity only. Business classification is managed in Business Activities."
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
              form="audit-entity-form"
              disabled={isSaving || isReadOnly}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Save
            </button>
          </>
        }
      >
        <form
          id="audit-entity-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {isReadOnly ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              You do not have create/update permission for this module.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <CrudTextField
                label="Entity Name"
                value={form.entity_name}
                required
                placeholder="Example: ABC Manufacturing Ltd."
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    entity_name: value,
                  }))
                }
              />
            </div>

            <label className="space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Entity Code
              </span>
              <input
                value={drawerMode === "create" ? "" : form.entity_code}
                readOnly
                disabled
                placeholder={
                  drawerMode === "create"
                    ? "Auto generated by system"
                    : "System generated"
                }
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
              />
              <p className="text-xs font-medium text-slate-500">
                Maintained by system to keep codes unique and consistent.
              </p>
            </label>

            <CrudSelectField
              label="Parent Entity"
              value={form.parent_entity_id}
              disabled={isMasterLoading}
              options={[
                { value: "", label: "No Parent" },
                ...parentEntities
                  .filter((entity) => entity.id !== selectedEntity?.id)
                  .map((entity) => ({
                    value: String(entity.id),
                    label: `${entity.entity_name} (${entity.entity_code})`,
                  })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  parent_entity_id: value,
                }))
              }
            />

            <CrudSelectField
              label="Entity Type"
              value={form.entity_type}
              options={entityTypes.map((type) => ({
                value: type,
                label: toTitle(type),
              }))}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  entity_type: value,
                }))
              }
            />

            <CrudSelectField
              label="Entity Class"
              value={form.entity_class}
              options={entityClasses.map((item) => ({
                value: item,
                label: toTitle(item),
              }))}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  entity_class: value,
                }))
              }
            />

            <CrudSelectField
              label="Legal Status"
              value={form.legal_status_id}
              disabled={isMasterLoading}
              options={[
                { value: "", label: "Select legal status" },
                ...legalStatuses.map((status) => ({
                  value: String(status.id),
                  label: status.legal_status_name,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  legal_status_id: value,
                }))
              }
            />

            <CrudSelectField
              label="Risk Rating"
              value={form.risk_rating}
              options={[
                { value: "", label: "Not Rated" },
                ...riskRatings.map((risk) => ({
                  value: risk,
                  label: toTitle(risk),
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  risk_rating: value,
                }))
              }
            />

            <CrudTextField
              label="Registration No"
              value={form.registration_no}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  registration_no: value,
                }))
              }
            />

            <CrudTextField
              label="TIN / Tax ID"
              value={form.tax_identification_no}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  tax_identification_no: value,
                }))
              }
            />

            <CrudTextField
              label="Contact Person"
              value={form.contact_person}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  contact_person: value,
                }))
              }
            />

            <CrudTextField
              label="Contact Email"
              type="email"
              value={form.contact_email}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  contact_email: value,
                }))
              }
            />

            <CrudTextField
              label="Contact Phone"
              type="tel"
              value={form.contact_phone}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  contact_phone: value,
                }))
              }
            />

            <CrudTextField
              label="City"
              value={form.city}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  city: value,
                }))
              }
            />

            <CrudTextField
              label="Country"
              value={form.country}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  country: value,
                }))
              }
            />

            <div className="md:col-span-2">
              <CrudTextAreaField
                label="Address"
                value={form.address}
                rows={3}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    address: value,
                  }))
                }
              />
            </div>

            <CrudCheckboxField
              label="Internal entity"
              checked={form.is_internal}
              onChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  is_internal: checked,
                }))
              }
            />

            <CrudCheckboxField
              label="Confidential entity"
              checked={form.is_confidential}
              onChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  is_confidential: checked,
                }))
              }
            />

            <div className="md:col-span-2">
              <CrudTextAreaField
                label="Description"
                value={form.description}
                rows={3}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    description: value,
                  }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <CrudTextAreaField
                label="Remarks"
                value={form.remarks}
                rows={3}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    remarks: value,
                  }))
                }
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          ) : null}

        </form>
      </CrudDrawer>

      {confirmTarget && confirmAction ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Action
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Are you sure you want to{" "}
                  <span className="font-semibold">
                    {confirmAction.replace("_", " ")}
                  </span>{" "}
                  this audit entity?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void executeConfirmAction()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

