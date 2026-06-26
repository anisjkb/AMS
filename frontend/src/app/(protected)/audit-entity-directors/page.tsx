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
  CheckCircle2,
  IdCard,
  Loader2,
  Mail,
  Pencil,
  Percent,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import { listAuditEntities, type AuditEntity } from "@/services/auditEntity";
import {
  createAuditEntityDirector,
  deactivateAuditEntityDirector,
  listAuditEntityDirectors,
  listAuditEntityDirectorTypes,
  permanentDeleteAuditEntityDirector,
  restoreAuditEntityDirector,
  updateAuditEntityDirector,
  type AuditEntityDirector,
  type AuditEntityDirectorPayload,
  type AuditEntityDirectorType,
} from "@/services/auditEntityDirector";

type StatusFilter = "all" | "active" | "inactive";
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";
type BooleanFilter = "" | "yes" | "no";

type FormState = {
  audit_entity_id: string;
  director_type_id: string;
  person_name: string;
  designation: string;
  father_name: string;
  mother_name: string;
  spouse_name: string;
  date_of_birth: string;
  nationality: string;
  nid_no: string;
  passport_no: string;
  tax_identification_no: string;
  email: string;
  phone: string;
  mobile: string;
  ownership_percentage: string;
  appointment_date: string;
  resignation_date: string;
  address: string;
  is_primary: boolean;
  is_signatory: boolean;
  is_beneficial_owner: boolean;
  remarks: string;
};

const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

const initialForm: FormState = {
  audit_entity_id: "",
  director_type_id: "",
  person_name: "",
  designation: "",
  father_name: "",
  mother_name: "",
  spouse_name: "",
  date_of_birth: "",
  nationality: "Bangladeshi",
  nid_no: "",
  passport_no: "",
  tax_identification_no: "",
  email: "",
  phone: "",
  mobile: "",
  ownership_percentage: "",
  appointment_date: "",
  resignation_date: "",
  address: "",
  is_primary: false,
  is_signatory: false,
  is_beneficial_owner: false,
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

function cleanNumber(value: string) {
  const cleaned = value.trim();

  if (!cleaned) return null;

  return Number(cleaned);
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

function formatPercentage(value: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";

  return `${Number(value).toFixed(2)}%`;
}

function toFormState(director: AuditEntityDirector): FormState {
  return {
    audit_entity_id: String(director.audit_entity_id),
    director_type_id: String(director.director_type_id),
    person_name: director.person_name,
    designation: director.designation ?? "",
    father_name: director.father_name ?? "",
    mother_name: director.mother_name ?? "",
    spouse_name: director.spouse_name ?? "",
    date_of_birth: director.date_of_birth ?? "",
    nationality: director.nationality ?? "",
    nid_no: director.nid_no ?? "",
    passport_no: director.passport_no ?? "",
    tax_identification_no: director.tax_identification_no ?? "",
    email: director.email ?? "",
    phone: director.phone ?? "",
    mobile: director.mobile ?? "",
    ownership_percentage:
      director.ownership_percentage === null ||
      director.ownership_percentage === undefined
        ? ""
        : String(director.ownership_percentage),
    appointment_date: director.appointment_date ?? "",
    resignation_date: director.resignation_date ?? "",
    address: director.address ?? "",
    is_primary: director.is_primary,
    is_signatory: director.is_signatory,
    is_beneficial_owner: director.is_beneficial_owner,
    remarks: director.remarks ?? "",
  };
}

export default function AuditEntityDirectorsPage() {
  const actions = useModuleActions("audit_entity_director");

  const [directors, setDirectors] = useState<AuditEntityDirector[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [directorTypes, setDirectorTypes] = useState<AuditEntityDirectorType[]>(
    [],
  );
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityFilter, setEntityFilter] = useState("");
  const [directorTypeFilter, setDirectorTypeFilter] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState<BooleanFilter>("");
  const [signatoryFilter, setSignatoryFilter] = useState<BooleanFilter>("");
  const [beneficialOwnerFilter, setBeneficialOwnerFilter] =
    useState<BooleanFilter>("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedDirector, setSelectedDirector] =
    useState<AuditEntityDirector | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AuditEntityDirector | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : pageSize;

  const entityById = useMemo(() => {
    return new Map(auditEntities.map((entity) => [entity.id, entity]));
  }, [auditEntities]);

  const directorTypeById = useMemo(() => {
    return new Map(directorTypes.map((type) => [type.id, type]));
  }, [directorTypes]);

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
      const [entityResponse, directorTypeResponse] = await Promise.all([
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "entity_name",
          sortOrder: "asc",
        }),
        listAuditEntityDirectorTypes(true),
      ]);

      setAuditEntities(entityResponse.items);
      setDirectorTypes(directorTypeResponse.items);
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

  const loadDirectors = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntityDirectors({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        auditEntityId: toOptionalNumber(entityFilter),
        directorTypeId: toOptionalNumber(directorTypeFilter),
        isPrimary: toBooleanFilter(primaryFilter),
        isSignatory: toBooleanFilter(signatoryFilter),
        isBeneficialOwner: toBooleanFilter(beneficialOwnerFilter),
        sortBy: "id",
        sortOrder: "desc",
      });

      setDirectors(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load directors/owners.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    beneficialOwnerFilter,
    debouncedSearch,
    directorTypeFilter,
    entityFilter,
    numericPageSize,
    page,
    primaryFilter,
    signatoryFilter,
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
      void loadDirectors();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadDirectors]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedDirector(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (director: AuditEntityDirector) => {
    setDrawerMode("edit");
    setSelectedDirector(director);
    setForm(toFormState(director));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setIsDrawerOpen(false);
    setSelectedDirector(null);
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

  const handleDirectorTypeFilterChange = (value: string) => {
    setDirectorTypeFilter(value);
    setPage(1);
  };

  const handlePrimaryFilterChange = (value: BooleanFilter) => {
    setPrimaryFilter(value);
    setPage(1);
  };

  const handleSignatoryFilterChange = (value: BooleanFilter) => {
    setSignatoryFilter(value);
    setPage(1);
  };

  const handleBeneficialOwnerFilterChange = (value: BooleanFilter) => {
    setBeneficialOwnerFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const buildPayload = (): AuditEntityDirectorPayload => {
    return {
      audit_entity_id: Number(form.audit_entity_id),
      director_type_id: Number(form.director_type_id),
      person_name: form.person_name.trim(),
      designation: cleanText(form.designation),
      father_name: cleanText(form.father_name),
      mother_name: cleanText(form.mother_name),
      spouse_name: cleanText(form.spouse_name),
      date_of_birth: cleanDate(form.date_of_birth),
      nationality: cleanText(form.nationality),
      nid_no: cleanText(form.nid_no),
      passport_no: cleanText(form.passport_no),
      tax_identification_no: cleanText(form.tax_identification_no),
      email: cleanText(form.email),
      phone: cleanText(form.phone),
      mobile: cleanText(form.mobile),
      ownership_percentage: cleanNumber(form.ownership_percentage),
      appointment_date: cleanDate(form.appointment_date),
      resignation_date: cleanDate(form.resignation_date),
      address: cleanText(form.address),
      is_primary: form.is_primary,
      is_signatory: form.is_signatory,
      is_beneficial_owner: form.is_beneficial_owner,
      remarks: cleanText(form.remarks),
    };
  };

  const validateForm = () => {
    if (!form.audit_entity_id) {
      return "Audit entity is required.";
    }

    if (!form.director_type_id) {
      return "Director/owner type is required.";
    }

    if (!form.person_name.trim()) {
      return "Person name is required.";
    }

    const ownershipPercentage = cleanNumber(form.ownership_percentage);

    if (
      ownershipPercentage !== null &&
      (Number.isNaN(ownershipPercentage) ||
        ownershipPercentage < 0 ||
        ownershipPercentage > 100)
    ) {
      return "Ownership percentage must be between 0 and 100.";
    }

    if (form.email.trim() === "" && form.mobile.trim() === "" && form.nid_no.trim() === "") {
      return "At least one identifier/contact is required: NID, mobile or email.";
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
        await createAuditEntityDirector(buildPayload());
        setSuccessMessage("Director/owner created successfully.");
      } else if (selectedDirector) {
        await updateAuditEntityDirector(selectedDirector.id, buildPayload());
        setSuccessMessage("Director/owner updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedDirector(null);
      setForm(initialForm);

      await loadDirectors();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save director/owner.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (
    director: AuditEntityDirector,
    action: ConfirmAction,
  ) => {
    setConfirmTarget(director);
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
        await deactivateAuditEntityDirector(confirmTarget.id);
        setSuccessMessage("Director/owner deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityDirector(confirmTarget.id);
        setSuccessMessage("Director/owner restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityDirector(confirmTarget.id);
        setSuccessMessage("Director/owner permanently deleted successfully.");
      }

      closeConfirm();
      await loadDirectors();
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
                <UsersRound className="h-4 w-4" />
                Audit Entity Profile
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                Directors / Owners
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Maintain directors, owners, partners, shareholders, beneficial
                owners and authorized signatories for audit entities.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add Director / Owner
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
                  placeholder="Search name, NID, passport, mobile, email..."
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
                Type
              </span>
              <select
                value={directorTypeFilter}
                onChange={(event) =>
                  handleDirectorTypeFilterChange(event.target.value)
                }
                disabled={isMasterLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
              >
                <option value="">All</option>
                {directorTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.director_type_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Primary
              </span>
              <select
                value={primaryFilter}
                onChange={(event) =>
                  handlePrimaryFilterChange(event.target.value as BooleanFilter)
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
                Signatory
              </span>
              <select
                value={signatoryFilter}
                onChange={(event) =>
                  handleSignatoryFilterChange(event.target.value as BooleanFilter)
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
                Beneficial
              </span>
              <select
                value={beneficialOwnerFilter}
                onChange={(event) =>
                  handleBeneficialOwnerFilterChange(
                    event.target.value as BooleanFilter,
                  )
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
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Type / Ownership
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Identity
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contact
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
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading directors/owners...
                    </div>
                  </td>
                </tr>
              ) : directors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <UsersRound className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No directors/owners found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add directors, owners, shareholders or signatories.
                    </p>
                  </td>
                </tr>
              ) : (
                directors.map((director) => {
                  const entity = entityById.get(director.audit_entity_id);
                  const directorType = directorTypeById.get(
                    director.director_type_id,
                  );
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    director.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !director.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !director.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={director.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity?.entity_name ??
                            `Entity #${director.audit_entity_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity?.entity_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {director.person_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {director.designation ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Nationality: {director.nationality ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {directorType?.director_type_name ??
                            `Type #${director.director_type_id}`}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Percent className="h-3.5 w-3.5" />
                          Ownership:{" "}
                          {formatPercentage(director.ownership_percentage)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Appointed: {director.appointment_date ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <IdCard className="h-3.5 w-3.5 text-slate-400" />
                          NID: {director.nid_no ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Passport: {director.passport_no ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          TIN: {director.tax_identification_no ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {director.email ?? "-"}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          Mobile: {director.mobile ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Phone: {director.phone ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {director.is_primary ? (
                            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              Primary
                            </span>
                          ) : null}

                          {director.is_signatory ? (
                            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              Signatory
                            </span>
                          ) : null}

                          {director.is_beneficial_owner ? (
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              Beneficial Owner
                            </span>
                          ) : null}

                          {!director.is_primary &&
                          !director.is_signatory &&
                          !director.is_beneficial_owner ? (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              Regular
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            director.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {director.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(director)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(director, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(director, "restore")}
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
                                openConfirm(director, "permanent_delete")
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
          <div className="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {drawerMode === "create"
                    ? "Create Director / Owner"
                    : "Edit Director / Owner"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep ownership, identity, signatory and beneficial owner
                  information.
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
                    Director / Owner Type{" "}
                    <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.director_type_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        director_type_id: event.target.value,
                      }))
                    }
                    disabled={isMasterLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  >
                    <option value="">Select type</option>
                    {directorTypes.map((type) => (
                      <option key={type.id} value={String(type.id)}>
                        {type.director_type_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Person Name <span className="text-rose-500">*</span>
                  </span>
                  <input
                    value={form.person_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        person_name: event.target.value,
                      }))
                    }
                    placeholder="Example: Mr. Rahman"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Designation
                  </span>
                  <input
                    value={form.designation}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        designation: event.target.value,
                      }))
                    }
                    placeholder="Example: Managing Director"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Ownership %
                  </span>
                  <input
                    value={form.ownership_percentage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        ownership_percentage: event.target.value,
                      }))
                    }
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Example: 25.00"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Nationality
                  </span>
                  <input
                    value={form.nationality}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nationality: event.target.value,
                      }))
                    }
                    placeholder="Bangladeshi"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    NID No
                  </span>
                  <input
                    value={form.nid_no}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nid_no: event.target.value,
                      }))
                    }
                    placeholder="NID number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Passport No
                  </span>
                  <input
                    value={form.passport_no}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        passport_no: event.target.value,
                      }))
                    }
                    placeholder="Passport number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    TIN
                  </span>
                  <input
                    value={form.tax_identification_no}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tax_identification_no: event.target.value,
                      }))
                    }
                    placeholder="Tax identification number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Date of Birth
                  </span>
                  <input
                    value={form.date_of_birth}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date_of_birth: event.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Appointment Date
                  </span>
                  <input
                    value={form.appointment_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        appointment_date: event.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Resignation Date
                  </span>
                  <input
                    value={form.resignation_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        resignation_date: event.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Father Name
                  </span>
                  <input
                    value={form.father_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        father_name: event.target.value,
                      }))
                    }
                    placeholder="Father name"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Mother Name
                  </span>
                  <input
                    value={form.mother_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        mother_name: event.target.value,
                      }))
                    }
                    placeholder="Mother name"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Spouse Name
                  </span>
                  <input
                    value={form.spouse_name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        spouse_name: event.target.value,
                      }))
                    }
                    placeholder="Spouse name"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <input
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Mobile
                  </span>
                  <input
                    value={form.mobile}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        mobile: event.target.value,
                      }))
                    }
                    placeholder="Example: 017..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Phone
                  </span>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Office phone"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Primary
                  </span>
                  <select
                    value={form.is_primary ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_primary: event.target.value === "yes",
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
                    Signatory
                  </span>
                  <select
                    value={form.is_signatory ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_signatory: event.target.value === "yes",
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
                    Beneficial Owner
                  </span>
                  <select
                    value={form.is_beneficial_owner ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_beneficial_owner: event.target.value === "yes",
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
                    Address
                  </span>
                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Personal / office address"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
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
                  this director/owner?
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


