"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Network,
  Pencil,
  Plus,
  RotateCcw,
  Star,
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
  createAuditEntityBusinessActivity,
  deactivateAuditEntityBusinessActivity,
  listAuditEntityBusinessActivities,
  permanentDeleteAuditEntityBusinessActivity,
  restoreAuditEntityBusinessActivity,
  updateAuditEntityBusinessActivity,
  type AuditEntityBusinessActivity,
  type AuditEntityBusinessActivityPayload,
} from "@/services/auditEntityBusinessActivity";
import { listAuditEntities, type AuditEntity } from "@/services/auditEntity";
import {
  listBusinessIndustries,
  listBusinessNatures,
  listBusinessSectors,
  type BusinessIndustry,
  type BusinessNature,
  type BusinessSector,
} from "@/services/businessMaster";

type StatusFilter = "all" | "active" | "inactive";
type PrimaryFilter = "all" | "primary" | "other";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";
type PageMessage = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  audit_entity_id: string;
  activity_code: string;
  activity_name: string;
  business_nature_id: string;
  business_sector_id: string;
  business_industry_id: string;
  is_primary: boolean;
  risk_rating: string;
  revenue_percentage: string;
  description: string;
  remarks: string;
};

const riskRatings = ["low", "medium", "high", "critical"];

const emptyForm: FormState = {
  audit_entity_id: "",
  activity_code: "",
  activity_name: "",
  business_nature_id: "",
  business_sector_id: "",
  business_industry_id: "",
  is_primary: false,
  risk_rating: "",
  revenue_percentage: "",
  description: "",
  remarks: "",
};

function toTitle(value: string | null | undefined) {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanText(value: string) {
  const cleaned = value.trim();

  return cleaned ? cleaned : null;
}

function toOptionalNumber(value: string) {
  if (!value) return null;

  return Number(value);
}

function toRequiredNumber(value: string) {
  return Number(value);
}


function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildFormFromActivity(
  activity: AuditEntityBusinessActivity,
): FormState {
  return {
    audit_entity_id: String(activity.audit_entity_id),
    activity_code: activity.activity_code ?? "",
    activity_name: activity.activity_name ?? "",
    business_nature_id: String(activity.business_nature_id),
    business_sector_id: String(activity.business_sector_id),
    business_industry_id: String(activity.business_industry_id),
    is_primary: activity.is_primary,
    risk_rating: activity.risk_rating ?? "",
    revenue_percentage:
      activity.revenue_percentage === null
        ? ""
        : String(activity.revenue_percentage),
    description: activity.description ?? "",
    remarks: activity.remarks ?? "",
  };
}

export default function AuditEntityBusinessActivitiesPage() {
  const activityActions = useModuleActions("audit_entity_business_activity");

  const [items, setItems] = useState<AuditEntityBusinessActivity[]>([]);
  const [total, setTotal] = useState(0);

  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [businessNatures, setBusinessNatures] = useState<BusinessNature[]>([]);
  const [businessSectors, setBusinessSectors] = useState<BusinessSector[]>([]);
  const [businessIndustries, setBusinessIndustries] = useState<
    BusinessIndustry[]
  >([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryFilter>("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [riskFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [masterLoading, setMasterLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<PageMessage | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedActivity, setSelectedActivity] =
    useState<AuditEntityBusinessActivity | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [confirmActivity, setConfirmActivity] =
    useState<AuditEntityBusinessActivity | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(search, 400);
  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(total / numericPageSize));

  const auditEntityById = useMemo(() => {
    return new Map(auditEntities.map((item) => [item.id, item]));
  }, [auditEntities]);

  const businessNatureById = useMemo(() => {
    return new Map(businessNatures.map((item) => [item.id, item]));
  }, [businessNatures]);

  const businessSectorById = useMemo(() => {
    return new Map(businessSectors.map((item) => [item.id, item]));
  }, [businessSectors]);

  const businessIndustryById = useMemo(() => {
    return new Map(businessIndustries.map((item) => [item.id, item]));
  }, [businessIndustries]);

  const filteredBusinessSectors = useMemo(() => {
    if (!form.business_nature_id) return [];

    return businessSectors.filter(
      (item) => String(item.nature_id) === form.business_nature_id,
    );
  }, [businessSectors, form.business_nature_id]);

  const filteredBusinessIndustries = useMemo(() => {
    if (!form.business_sector_id) return [];

    return businessIndustries.filter(
      (item) => String(item.sector_id) === form.business_sector_id,
    );
  }, [businessIndustries, form.business_sector_id]);

  const showTopActions =
    activityActions.canCreate ||
    activityActions.canExport ||
    activityActions.canImport;

  const showRowActions =
    activityActions.canUpdate ||
    activityActions.canDelete ||
    activityActions.canRestore ||
    activityActions.canPermanentDelete;

  const tableColumnCount = showRowActions ? 12 : 11;

  const isActiveFilter = useMemo(() => {
    if (statusFilter === "active") return true;
    if (statusFilter === "inactive") return false;

    return undefined;
  }, [statusFilter]);

  const isPrimaryFilter = useMemo(() => {
    if (primaryFilter === "primary") return true;
    if (primaryFilter === "other") return false;

    return undefined;
  }, [primaryFilter]);

  const loadMasterData = useCallback(async () => {
    setMasterLoading(true);

    try {
      const [entityResponse, natures, sectors, industries] = await Promise.all([
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "id",
          sortOrder: "asc",
        } as never),
        listBusinessNatures(),
        listBusinessSectors(),
        listBusinessIndustries(),
      ]);

      setAuditEntities(entityResponse.items);
      setBusinessNatures(natures);
      setBusinessSectors(sectors);
      setBusinessIndustries(industries);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load master data.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setMasterLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await listAuditEntityBusinessActivities({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim(),
        isActive: isActiveFilter,
        auditEntityId:
          entityFilter === "all" ? undefined : Number(entityFilter),
        isPrimary: isPrimaryFilter,
        riskRating: riskFilter === "all" ? undefined : riskFilter,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load business activities.";

      setMessage({ type: "error", text: errorMessage });
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    entityFilter,
    isActiveFilter,
    isPrimaryFilter,
    numericPageSize,
    page,
    riskFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMasterData();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadMasterData]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadActivities();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadActivities]);

  const resetToFirstPage = () => {
    setPage(1);
  };

  const handleBusinessNatureChange = (value: string) => {
    setForm((current) => ({
      ...current,
      business_nature_id: value,
      business_sector_id: "",
      business_industry_id: "",
    }));
  };

  const handleBusinessSectorChange = (value: string) => {
    setForm((current) => ({
      ...current,
      business_sector_id: value,
      business_industry_id: "",
    }));
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedActivity(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEditDrawer = (activity: AuditEntityBusinessActivity) => {
    setDrawerMode("edit");
    setSelectedActivity(activity);
    setForm(buildFormFromActivity(activity));
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (submitLoading) return;

    setDrawerOpen(false);
    setSelectedActivity(null);
    setForm(emptyForm);
  };

  const openConfirm = (
    activity: AuditEntityBusinessActivity,
    action: ConfirmAction,
  ) => {
    setConfirmActivity(activity);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (submitLoading) return;

    setConfirmActivity(null);
    setConfirmAction(null);
  };

  const clearConfirm = () => {
    setConfirmActivity(null);
    setConfirmAction(null);
  };

  const buildPayload = (): AuditEntityBusinessActivityPayload => {
    return {
      audit_entity_id: toRequiredNumber(form.audit_entity_id),
      activity_code: cleanText(form.activity_code),
      activity_name: form.activity_name.trim(),
      business_nature_id: toRequiredNumber(form.business_nature_id),
      business_sector_id: toRequiredNumber(form.business_sector_id),
      business_industry_id: toRequiredNumber(form.business_industry_id),
      is_primary: form.is_primary,
      risk_rating: cleanText(form.risk_rating),
      revenue_percentage: toOptionalNumber(form.revenue_percentage),
      description: cleanText(form.description),
      remarks: cleanText(form.remarks),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.audit_entity_id) {
      setMessage({ type: "error", text: "Audit entity is required." });
      return;
    }

    if (!form.activity_name.trim()) {
      setMessage({ type: "error", text: "Activity name is required." });
      return;
    }

    if (
      !form.business_nature_id ||
      !form.business_sector_id ||
      !form.business_industry_id
    ) {
      setMessage({ type: "error", text: "Business nature, sector, and industry are required." });
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const payload = buildPayload();

      if (drawerMode === "edit" && selectedActivity) {
        await updateAuditEntityBusinessActivity(selectedActivity.id, payload);
        setMessage({ type: "success", text: "Business activity updated successfully." });
      } else {
        await createAuditEntityBusinessActivity(payload);
        setMessage({ type: "success", text: "Business activity created successfully." });
      }

      setDrawerOpen(false);
      setSelectedActivity(null);
      setForm(emptyForm);
      await loadMasterData();
      await loadActivities();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save business activity.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmActivity || !confirmAction) return;

    setSubmitLoading(true);
    setMessage(null);

    try {
      if (confirmAction === "delete") {
        await deactivateAuditEntityBusinessActivity(confirmActivity.id);
        setMessage({ type: "success", text: "Business activity deactivated successfully." });
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityBusinessActivity(confirmActivity.id);
        setMessage({ type: "success", text: "Business activity restored successfully." });
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityBusinessActivity(confirmActivity.id);
        setMessage({ type: "success", text: "Business activity permanently deleted successfully." });
      }

      clearConfirm();
      await loadMasterData();
      await loadActivities();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed.";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getActivitySummary = (activity: AuditEntityBusinessActivity) => {
    return {
      entityName:
        auditEntityById.get(activity.audit_entity_id)?.entity_name ?? "-",
      natureName:
        businessNatureById.get(activity.business_nature_id)?.nature_name ?? "-",
      sectorName:
        businessSectorById.get(activity.business_sector_id)?.sector_name ?? "-",
      industryName:
        businessIndustryById.get(activity.business_industry_id)?.industry_name ??
        "-",
    };
  };


  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-950 to-blue-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                Audit Entity Profile
              </p>
              <h1 className="mt-2 text-3xl font-black">
                Business Activities
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
                Manage one or more business activities under each audit entity.
              </p>
            </div>

            {showTopActions ? (
              <div className="flex flex-wrap gap-2">
                {activityActions.canCreate ? (
                  <button
                    onClick={openCreateDrawer}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-blue-50"
                  >
                    <Plus size={18} />
                    Create
                  </button>
                ) : null}

                {activityActions.canExport ? (
                  <button className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                    Export
                  </button>
                ) : null}

                {activityActions.canImport ? (
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
          onRefresh={loadActivities}
          onReset={() => {
            setSearch("");
            setEntityFilter("all");
            setPrimaryFilter("all");
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
              placeholder: "Search activity code, name, description...",
              onChange: (value) => {
                setSearch(value);
                resetToFirstPage();
              },
            },
            {
              key: "entity",
              label: "Entity",
              type: "select",
              value: entityFilter,
              options: [
                { value: "all", label: "All Entities" },
                ...auditEntities.map((entity) => ({
                  value: String(entity.id),
                  label: entity.entity_name,
                })),
              ],
              onChange: (value) => {
                setEntityFilter(value);
                resetToFirstPage();
              },
            },
            {
              key: "primary",
              label: "Primary",
              type: "select",
              value: primaryFilter,
              options: [
                { value: "all", label: "All" },
                { value: "primary", label: "Primary" },
                { value: "other", label: "Other" },
              ],
              onChange: (value) => {
                setPrimaryFilter(value as PrimaryFilter);
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
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">Activity</th>
                <th className="px-5 py-4">Nature</th>
                <th className="px-5 py-4">Sector</th>
                <th className="px-5 py-4">Industry</th>
                <th className="px-5 py-4">Risk</th>
                <th className="px-5 py-4">Revenue</th>
                <th className="px-5 py-4">Primary</th>
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
                      Loading business activities...
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={tableColumnCount} className="px-5 py-12">
                    <div className="text-center">
                      <Network size={42} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-600">
                        No business activities found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? items.map((activity) => {
                    const summary = getActivitySummary(activity);

                    return (
                      <tr key={activity.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm font-black text-slate-900">
                          {activity.activity_code}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {summary.entityName}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-black text-slate-800">
                            {activity.activity_name}
                          </div>
                          {activity.description ? (
                            <div className="mt-1 max-w-xs truncate text-xs text-slate-400">
                              {activity.description}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {summary.natureName}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {summary.sectorName}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {summary.industryName}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                            {toTitle(activity.risk_rating)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-500">
                          {activity.revenue_percentage === null
                            ? "-"
                            : `${activity.revenue_percentage}%`}
                        </td>
                        <td className="px-5 py-4">
                          {activity.is_primary ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                              <Star size={12} />
                              Primary
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              Other
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-black ${
                              activity.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {activity.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(activity.created_at)}
                        </td>

                        {showRowActions ? (
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {activityActions.canUpdate ? (
                                <button
                                  onClick={() => openEditDrawer(activity)}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                              ) : null}

                              {activity.is_active &&
                              activityActions.canDelete ? (
                                <button
                                  onClick={() => openConfirm(activity, "delete")}
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                  title="Inactive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : null}

                              {!activity.is_active &&
                              activityActions.canRestore ? (
                                <button
                                  onClick={() =>
                                    openConfirm(activity, "restore")
                                  }
                                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-600"
                                  title="Restore"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : null}

                              {!activity.is_active &&
                              activityActions.canPermanentDelete ? (
                                <button
                                  onClick={() =>
                                    openConfirm(activity, "permanent_delete")
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
        title="Business Activity"
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
              form="entity-business-activity-form"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {drawerMode === "create" ? "Create" : "Update"}
            </button>
          </>
        }
      >
        <form
          id="entity-business-activity-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <CrudSelectField
            label="Audit Entity"
            value={form.audit_entity_id}
            required
            disabled={masterLoading}
            options={[
              {
                value: "",
                label: masterLoading ? "Loading..." : "Select Audit Entity",
              },
              ...auditEntities.map((entity) => ({
                value: String(entity.id),
                label: entity.entity_name,
              })),
            ]}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                audit_entity_id: value,
              }))
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <CrudTextField
              label="Activity Code"
              value={form.activity_code}
              placeholder="Auto generated if blank"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  activity_code: value,
                }))
              }
            />

            <CrudTextField
              label="Activity Name"
              value={form.activity_name}
              required
              placeholder="Activity Name"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  activity_name: value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CrudSelectField
              label="Business Nature"
              value={form.business_nature_id}
              required
              disabled={masterLoading}
              options={[
                { value: "", label: "Business Nature" },
                ...businessNatures.map((nature) => ({
                  value: String(nature.id),
                  label: nature.nature_name,
                })),
              ]}
              onChange={handleBusinessNatureChange}
            />

            <CrudSelectField
              label="Business Sector"
              value={form.business_sector_id}
              required
              disabled={!form.business_nature_id || masterLoading}
              options={[
                { value: "", label: "Business Sector" },
                ...filteredBusinessSectors.map((sector) => ({
                  value: String(sector.id),
                  label: sector.sector_name,
                })),
              ]}
              onChange={handleBusinessSectorChange}
            />

            <CrudSelectField
              label="Business Industry"
              value={form.business_industry_id}
              required
              disabled={!form.business_sector_id || masterLoading}
              options={[
                { value: "", label: "Business Industry" },
                ...filteredBusinessIndustries.map((industry) => ({
                  value: String(industry.id),
                  label: industry.industry_name,
                })),
              ]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  business_industry_id: value,
                }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CrudSelectField
              label="Risk Rating"
              value={form.risk_rating}
              options={[
                { value: "", label: "Risk Rating" },
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
              label="Revenue Percentage"
              type="number"
              value={form.revenue_percentage}
              min="0"
              step="0.01"
              placeholder="Revenue Percentage"
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  revenue_percentage: value,
                }))
              }
            />
          </div>

          <CrudCheckboxField
            label="Mark as primary business activity"
            checked={form.is_primary}
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                is_primary: checked,
              }))
            }
          />

          <CrudTextAreaField
            label="Description"
            value={form.description}
            rows={3}
            placeholder="Description"
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                description: value,
              }))
            }
          />

          <CrudTextAreaField
            label="Remarks"
            value={form.remarks}
            rows={3}
            placeholder="Remarks"
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                remarks: value,
              }))
            }
          />

          {message && drawerOpen && message.type === "error" ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message.text}
            </div>
          ) : null}
        </form>
      </CrudDrawer>

      {confirmActivity && confirmAction ? (
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
                  this business activity?
                </p>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  {confirmActivity.activity_name}
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


