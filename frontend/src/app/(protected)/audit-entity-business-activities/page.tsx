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
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
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
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

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
const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

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

function parsePageSize(value: string): PageSizeOption {
  return value === "all" ? "all" : (Number(value) as PageSizeOption);
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
  const [pageSize, setPageSize] = useState<PageSizeOption>(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryFilter>("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [riskFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [masterLoading, setMasterLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
  const numericPageSize = pageSize === "all" ? 100 : pageSize;
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

      setMessage(errorMessage);
    } finally {
      setMasterLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

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

      setMessage(errorMessage);
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
      setMessage("Audit entity is required.");
      return;
    }

    if (!form.activity_name.trim()) {
      setMessage("Activity name is required.");
      return;
    }

    if (
      !form.business_nature_id ||
      !form.business_sector_id ||
      !form.business_industry_id
    ) {
      setMessage("Business nature, sector, and industry are required.");
      return;
    }

    setSubmitLoading(true);
    setMessage(null);

    try {
      const payload = buildPayload();

      if (drawerMode === "edit" && selectedActivity) {
        await updateAuditEntityBusinessActivity(selectedActivity.id, payload);
        setMessage("Business activity updated successfully.");
      } else {
        await createAuditEntityBusinessActivity(payload);
        setMessage("Business activity created successfully.");
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

      setMessage(errorMessage);
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
        setMessage("Business activity deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityBusinessActivity(confirmActivity.id);
        setMessage("Business activity restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityBusinessActivity(confirmActivity.id);
        setMessage("Business activity permanently deleted successfully.");
      }

      clearConfirm();
      await loadMasterData();
      await loadActivities();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed.";

      setMessage(errorMessage);
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

  const showingFrom = total === 0 ? 0 : (page - 1) * numericPageSize + 1;
  const showingTo = Math.min(page * numericPageSize, total);

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

        <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Show
            </label>
            <select
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(parsePageSize(event.target.value));
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400"
            >
              {pageSizeOptions.map((option) => (
                <option key={String(option)} value={String(option)}>
                  {option === "all" ? "All" : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Search
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetToFirstPage();
                }}
                placeholder="Search activity code, name, description..."
                className="ml-2 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Entity
            </label>
            <select
              value={entityFilter}
              onChange={(event) => {
                setEntityFilter(event.target.value);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400"
            >
              <option value="all">All Entities</option>
              {auditEntities.map((entity) => (
                <option key={entity.id} value={String(entity.id)}>
                  {entity.entity_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Primary
            </label>
            <select
              value={primaryFilter}
              onChange={(event) => {
                setPrimaryFilter(event.target.value as PrimaryFilter);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400"
            >
              <option value="all">All</option>
              <option value="primary">Primary</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter);
                resetToFirstPage();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {message ? (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700">
            {message}
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

        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center">
          <p>
            Showing{" "}
            <span className="font-black text-slate-700">{showingFrom}</span> to{" "}
            <span className="font-black text-slate-700">{showingTo}</span> of{" "}
            <span className="font-black text-slate-700">{total}</span> records
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              First
            </button>
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-lg bg-slate-900 px-3 py-2 font-black text-white">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </section>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  {drawerMode === "create" ? "Create" : "Edit"}
                </p>
                <h2 className="text-xl font-black text-slate-900">
                  Business Activity
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <select
                required
                value={form.audit_entity_id}
                disabled={masterLoading}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    audit_entity_id: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
              >
                <option value="">
                  {masterLoading ? "Loading..." : "Select Audit Entity"}
                </option>
                {auditEntities.map((entity) => (
                  <option key={entity.id} value={String(entity.id)}>
                    {entity.entity_name}
                  </option>
                ))}
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={form.activity_code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      activity_code: event.target.value,
                    }))
                  }
                  placeholder="Activity Code - auto generated if blank"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />

                <input
                  required
                  value={form.activity_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      activity_name: event.target.value,
                    }))
                  }
                  placeholder="Activity Name"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <select
                  required
                  value={form.business_nature_id}
                  disabled={masterLoading}
                  onChange={(event) =>
                    handleBusinessNatureChange(event.target.value)
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
                >
                  <option value="">Business Nature</option>
                  {businessNatures.map((nature) => (
                    <option key={nature.id} value={String(nature.id)}>
                      {nature.nature_name}
                    </option>
                  ))}
                </select>

                <select
                  required
                  value={form.business_sector_id}
                  disabled={!form.business_nature_id || masterLoading}
                  onChange={(event) =>
                    handleBusinessSectorChange(event.target.value)
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
                >
                  <option value="">Business Sector</option>
                  {filteredBusinessSectors.map((sector) => (
                    <option key={sector.id} value={String(sector.id)}>
                      {sector.sector_name}
                    </option>
                  ))}
                </select>

                <select
                  required
                  value={form.business_industry_id}
                  disabled={!form.business_sector_id || masterLoading}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      business_industry_id: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
                >
                  <option value="">Business Industry</option>
                  {filteredBusinessIndustries.map((industry) => (
                    <option key={industry.id} value={String(industry.id)}>
                      {industry.industry_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={form.risk_rating}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      risk_rating: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Risk Rating</option>
                  {riskRatings.map((risk) => (
                    <option key={risk} value={risk}>
                      {toTitle(risk)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.revenue_percentage}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      revenue_percentage: event.target.value,
                    }))
                  }
                  placeholder="Revenue Percentage"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      is_primary: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Mark as primary business activity
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Description"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />

              <textarea
                value={form.remarks}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    remarks: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Remarks"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {drawerMode === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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


