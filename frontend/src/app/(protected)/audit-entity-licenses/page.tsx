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
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import { listAuditEntities, type AuditEntity } from "@/services/auditEntity";
import {
  createAuditEntityLicense,
  deactivateAuditEntityLicense,
  listAuditEntityLicenses,
  listAuditEntityLicenseTypes,
  permanentDeleteAuditEntityLicense,
  restoreAuditEntityLicense,
  updateAuditEntityLicense,
  type AuditEntityLicense,
  type AuditEntityLicensePayload,
  type AuditEntityLicenseStatus,
  type AuditEntityLicenseType,
} from "@/services/auditEntityLicense";

type StatusFilter = "all" | "active" | "inactive";
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";
type BooleanFilter = "" | "yes" | "no";

type FormState = {
  audit_entity_id: string;
  license_type_id: string;
  license_no: string;
  license_name: string;
  issuing_authority: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
  renewal_due_date: string;
  license_status: AuditEntityLicenseStatus;
  document_reference: string;
  is_mandatory: boolean;
  is_verified: boolean;
  remarks: string;
};

const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

const licenseStatusOptions: {
  value: AuditEntityLicenseStatus;
  label: string;
}[] = [
  { value: "valid", label: "Valid" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Cancelled" },
  { value: "not_applicable", label: "Not Applicable" },
];

const initialForm: FormState = {
  audit_entity_id: "",
  license_type_id: "",
  license_no: "",
  license_name: "",
  issuing_authority: "",
  issuing_country: "Bangladesh",
  issue_date: "",
  expiry_date: "",
  renewal_due_date: "",
  license_status: "valid",
  document_reference: "",
  is_mandatory: false,
  is_verified: false,
  remarks: "",
};

function cleanText(value: string) {
  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function cleanDate(value: string) {
  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function toOptionalNumber(value: string) {
  if (!value) return undefined;

  return Number(value);
}

function toBooleanFilter(value: BooleanFilter) {
  if (value === "yes") return true;
  if (value === "no") return false;

  return undefined;
}

function getLicenseStatusLabel(value: string) {
  return (
    licenseStatusOptions.find((option) => option.value === value)?.label ??
    value
  );
}

function getLicenseStatusClass(value: string) {
  if (value === "valid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "expired" || value === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (value === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "suspended") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function toFormState(license: AuditEntityLicense): FormState {
  return {
    audit_entity_id: String(license.audit_entity_id),
    license_type_id: String(license.license_type_id),
    license_no: license.license_no,
    license_name: license.license_name ?? "",
    issuing_authority: license.issuing_authority ?? "",
    issuing_country: license.issuing_country ?? "",
    issue_date: license.issue_date ?? "",
    expiry_date: license.expiry_date ?? "",
    renewal_due_date: license.renewal_due_date ?? "",
    license_status: license.license_status,
    document_reference: license.document_reference ?? "",
    is_mandatory: license.is_mandatory,
    is_verified: license.is_verified,
    remarks: license.remarks ?? "",
  };
}

export default function AuditEntityLicensesPage() {
  const actions = useModuleActions("audit_entity_license");

  const [licenses, setLicenses] = useState<AuditEntityLicense[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<AuditEntityLicenseType[]>(
    [],
  );
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityFilter, setEntityFilter] = useState("");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState("");
  const [licenseStatusFilter, setLicenseStatusFilter] = useState("");
  const [mandatoryFilter, setMandatoryFilter] = useState<BooleanFilter>("");
  const [verifiedFilter, setVerifiedFilter] = useState<BooleanFilter>("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedLicense, setSelectedLicense] =
    useState<AuditEntityLicense | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AuditEntityLicense | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : pageSize;

  const entityById = useMemo(() => {
    return new Map(auditEntities.map((entity) => [entity.id, entity]));
  }, [auditEntities]);

  const licenseTypeById = useMemo(() => {
    return new Map(licenseTypes.map((type) => [type.id, type]));
  }, [licenseTypes]);

  const totalPages = useMemo(() => {
    if (totalRecords === 0) return 1;

    return Math.max(1, Math.ceil(totalRecords / numericPageSize));
  }, [numericPageSize, totalRecords]);

  const showingFrom = totalRecords === 0 ? 0 : (page - 1) * numericPageSize + 1;
  const showingTo = Math.min(page * numericPageSize, totalRecords);

  const isReadOnly = !actions.canCreate && !actions.canUpdate;

  const loadMasterData = useCallback(async () => {
    setIsMasterLoading(true);

    try {
      const [entityResponse, licenseTypeResponse] = await Promise.all([
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "entity_name",
          sortOrder: "asc",
        }),
        listAuditEntityLicenseTypes(true),
      ]);

      setAuditEntities(entityResponse.items);
      setLicenseTypes(licenseTypeResponse.items);
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

  const loadLicenses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntityLicenses({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        auditEntityId: toOptionalNumber(entityFilter),
        licenseTypeId: toOptionalNumber(licenseTypeFilter),
        licenseStatus:
          licenseStatusFilter === ""
            ? undefined
            : (licenseStatusFilter as AuditEntityLicenseStatus),
        isMandatory: toBooleanFilter(mandatoryFilter),
        isVerified: toBooleanFilter(verifiedFilter),
        sortBy: "id",
        sortOrder: "desc",
      });

      setLicenses(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load licenses.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    entityFilter,
    licenseStatusFilter,
    licenseTypeFilter,
    mandatoryFilter,
    numericPageSize,
    page,
    statusFilter,
    verifiedFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMasterData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadMasterData]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadLicenses();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadLicenses]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedLicense(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (license: AuditEntityLicense) => {
    setDrawerMode("edit");
    setSelectedLicense(license);
    setForm(toFormState(license));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setIsDrawerOpen(false);
    setSelectedLicense(null);
    setForm(initialForm);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === "all" ? "all" : (Number(value) as PageSizeOption));
    setPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
    setPage(1);
  };

  const handleLicenseTypeFilterChange = (value: string) => {
    setLicenseTypeFilter(value);
    setPage(1);
  };

  const handleLicenseStatusFilterChange = (value: string) => {
    setLicenseStatusFilter(value);
    setPage(1);
  };

  const handleMandatoryFilterChange = (value: BooleanFilter) => {
    setMandatoryFilter(value);
    setPage(1);
  };

  const handleVerifiedFilterChange = (value: BooleanFilter) => {
    setVerifiedFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const buildPayload = (): AuditEntityLicensePayload => {
    return {
      audit_entity_id: Number(form.audit_entity_id),
      license_type_id: Number(form.license_type_id),
      license_no: form.license_no.trim(),
      license_name: cleanText(form.license_name),
      issuing_authority: cleanText(form.issuing_authority),
      issuing_country: cleanText(form.issuing_country),
      issue_date: cleanDate(form.issue_date),
      expiry_date: cleanDate(form.expiry_date),
      renewal_due_date: cleanDate(form.renewal_due_date),
      license_status: form.license_status,
      document_reference: cleanText(form.document_reference),
      is_mandatory: form.is_mandatory,
      is_verified: form.is_verified,
      remarks: cleanText(form.remarks),
    };
  };

  const validateForm = () => {
    if (!form.audit_entity_id) {
      return "Audit entity is required.";
    }

    if (!form.license_type_id) {
      return "License type is required.";
    }

    if (!form.license_no.trim()) {
      return "License number is required.";
    }

    if (
      form.issue_date &&
      form.expiry_date &&
      form.expiry_date < form.issue_date
    ) {
      return "Expiry date cannot be earlier than issue date.";
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
        await createAuditEntityLicense(buildPayload());
        setSuccessMessage("License created successfully.");
      } else if (selectedLicense) {
        await updateAuditEntityLicense(selectedLicense.id, buildPayload());
        setSuccessMessage("License updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedLicense(null);
      setForm(initialForm);

      await loadLicenses();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save license.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (
    license: AuditEntityLicense,
    action: ConfirmAction,
  ) => {
    setConfirmTarget(license);
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
        await deactivateAuditEntityLicense(confirmTarget.id);
        setSuccessMessage("License deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityLicense(confirmTarget.id);
        setSuccessMessage("License restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityLicense(confirmTarget.id);
        setSuccessMessage("License permanently deleted successfully.");
      }

      closeConfirm();
      await loadLicenses();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to complete action.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const goFirst = () => setPage(1);
  const goPrevious = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () => setPage((current) => Math.min(totalPages, current + 1));
  const goLast = () => setPage(totalPages);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                <FileText className="h-4 w-4" />
                Audit Entity Profile
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                Entity Licenses
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Maintain trade license, BIN/VAT, TIN, RJSC, IRC, ERC,
                environment clearance, factory license and other regulatory
                approvals.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add License
              </button>
            ) : null}
          </div>
        </div>

        <div className="border-b border-slate-200 px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Show
              </span>
              <select
                value={String(pageSize)}
                onChange={(event) => handlePageSizeChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                {pageSizeOptions.map((option) => (
                  <option key={String(option)} value={String(option)}>
                    {option === "all" ? "All" : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Search
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search license no, authority, document ref..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm outline-none transition focus:border-slate-500"
                />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  handleStatusFilterChange(event.target.value as StatusFilter)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Entity
              </span>
              <select
                value={entityFilter}
                onChange={(event) =>
                  handleEntityFilterChange(event.target.value)
                }
                disabled={isMasterLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
              >
                <option value="">All</option>
                {auditEntities.map((entity) => (
                  <option key={entity.id} value={String(entity.id)}>
                    {entity.entity_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                License Type
              </span>
              <select
                value={licenseTypeFilter}
                onChange={(event) =>
                  handleLicenseTypeFilterChange(event.target.value)
                }
                disabled={isMasterLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
              >
                <option value="">All</option>
                {licenseTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.license_type_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                License Status
              </span>
              <select
                value={licenseStatusFilter}
                onChange={(event) =>
                  handleLicenseStatusFilterChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                {licenseStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Mandatory
              </span>
              <select
                value={mandatoryFilter}
                onChange={(event) =>
                  handleMandatoryFilterChange(event.target.value as BooleanFilter)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Verified
              </span>
              <select
                value={verifiedFilter}
                onChange={(event) =>
                  handleVerifiedFilterChange(event.target.value as BooleanFilter)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>
        </div>

        {errorMessage ? (
          <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mx-6 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
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
                  License
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Authority
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Flags
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
                      Loading licenses...
                    </div>
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <FileText className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No licenses found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add entity licenses and regulatory approvals.
                    </p>
                  </td>
                </tr>
              ) : (
                licenses.map((license) => {
                  const entity = entityById.get(license.audit_entity_id);
                  const licenseType = licenseTypeById.get(license.license_type_id);
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    license.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !license.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !license.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={license.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity?.entity_name ??
                            `Entity #${license.audit_entity_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity?.entity_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {licenseType?.license_type_name ??
                            `Type #${license.license_type_id}`}
                        </div>
                        <div className="mt-1 text-sm text-slate-700">
                          No: {license.license_no}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Name: {license.license_name ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Ref: {license.document_reference ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {license.issuing_authority ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Country: {license.issuing_country ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                          Issue: {license.issue_date ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Expiry: {license.expiry_date ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Renewal Due: {license.renewal_due_date ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {license.is_mandatory ? (
                            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              Mandatory
                            </span>
                          ) : null}

                          {license.is_verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              <BadgeCheck className="h-3 w-3" />
                              Verified
                            </span>
                          ) : null}

                          {!license.is_mandatory && !license.is_verified ? (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              Regular
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getLicenseStatusClass(
                              license.license_status,
                            )}`}
                          >
                            {getLicenseStatusLabel(license.license_status)}
                          </span>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                license.is_active
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {license.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(license)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(license, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(license, "restore")}
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
                                openConfirm(license, "permanent_delete")
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

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">{showingFrom}</span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">{showingTo}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{totalRecords}</span>{" "}
            records
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goFirst}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              First
            </button>
            <button
              type="button"
              onClick={goPrevious}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 font-semibold text-slate-900">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              onClick={goLast}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </section>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {drawerMode === "create"
                    ? "Create Entity License"
                    : "Edit Entity License"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep regulatory license number, authority, expiry and
                  verification status.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              {isReadOnly ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  You do not have create/update permission for this module.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Audit Entity <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.audit_entity_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        audit_entity_id: event.target.value,
                      }))
                    }
                    disabled={isMasterLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  >
                    <option value="">
                      {isMasterLoading ? "Loading entities..." : "Select entity"}
                    </option>
                    {auditEntities.map((entity) => (
                      <option key={entity.id} value={String(entity.id)}>
                        {entity.entity_name} ({entity.entity_code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    License Type <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.license_type_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        license_type_id: event.target.value,
                      }))
                    }
                    disabled={isMasterLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  >
                    <option value="">Select license type</option>
                    {licenseTypes.map((type) => (
                      <option key={type.id} value={String(type.id)}>
                        {type.license_type_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    License No <span className="text-rose-500">*</span>
                  </span>
                  <input
                    value={form.license_no}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        license_no: event.target.value,
                      }))
                    }
                    placeholder="License / registration number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    License Name
                  </span>
                  <input
                    value={form.license_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        license_name: event.target.value,
                      }))
                    }
                    placeholder="Optional display name"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    License Status
                  </span>
                  <select
                    value={form.license_status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        license_status: event.target
                          .value as AuditEntityLicenseStatus,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    {licenseStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Issuing Authority
                  </span>
                  <input
                    value={form.issuing_authority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        issuing_authority: event.target.value,
                      }))
                    }
                    placeholder="Example: RJSC, NBR, City Corporation"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Issuing Country
                  </span>
                  <input
                    value={form.issuing_country}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        issuing_country: event.target.value,
                      }))
                    }
                    placeholder="Bangladesh"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Issue Date
                  </span>
                  <input
                    value={form.issue_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        issue_date: event.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Expiry Date
                  </span>
                  <input
                    value={form.expiry_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        expiry_date: event.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Renewal Due Date
                  </span>
                  <input
                    value={form.renewal_due_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        renewal_due_date: event.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Document Reference
                  </span>
                  <input
                    value={form.document_reference}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        document_reference: event.target.value,
                      }))
                    }
                    placeholder="File ID / document code / location"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Mandatory
                  </span>
                  <select
                    value={form.is_mandatory ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_mandatory: event.target.value === "yes",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Verified
                  </span>
                  <select
                    value={form.is_verified ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_verified: event.target.value === "yes",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Remarks
                  </span>
                  <textarea
                    value={form.remarks}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        remarks: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Optional remarks"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
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
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
                  this license?
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


