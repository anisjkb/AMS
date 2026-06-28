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
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
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
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
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

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

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
    setPageSize(value as CrudPageSizeOption);
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

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={loadDirectors}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setEntityFilter("");
            setDirectorTypeFilter("");
            setPrimaryFilter("");
            setSignatoryFilter("");
            setBeneficialOwnerFilter("");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            setPage(1);
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search name, NID, passport, mobile, email...",
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
              key: "entity",
              label: "Entity",
              type: "select",
              value: entityFilter,
              disabled: isMasterLoading,
              options: [
                { value: "", label: "All" },
                ...auditEntities.map((entity) => ({
                  value: String(entity.id),
                  label: entity.entity_name,
                })),
              ],
              onChange: handleEntityFilterChange,
            },
            {
              key: "directorType",
              label: "Type",
              type: "select",
              value: directorTypeFilter,
              disabled: isMasterLoading,
              options: [
                { value: "", label: "All" },
                ...directorTypes.map((type) => ({
                  value: String(type.id),
                  label: type.director_type_name,
                })),
              ],
              onChange: handleDirectorTypeFilterChange,
            },
            {
              key: "primary",
              label: "Primary",
              type: "select",
              value: primaryFilter,
              options: [
                { value: "", label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ],
              onChange: (value) =>
                handlePrimaryFilterChange(value as BooleanFilter),
            },
            {
              key: "signatory",
              label: "Signatory",
              type: "select",
              value: signatoryFilter,
              options: [
                { value: "", label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ],
              onChange: (value) =>
                handleSignatoryFilterChange(value as BooleanFilter),
            },
            {
              key: "beneficial",
              label: "Beneficial",
              type: "select",
              value: beneficialOwnerFilter,
              options: [
                { value: "", label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ],
              onChange: (value) =>
                handleBeneficialOwnerFilterChange(value as BooleanFilter),
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
        title={drawerMode === "create" ? "Create Director / Owner" : "Edit Director / Owner"}
        description="Keep ownership, identity, signatory and beneficial owner information."
        maxWidthClassName="max-w-4xl"
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
              form="director-owner-form"
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
        <form id="director-owner-form" onSubmit={handleSubmit} className="space-y-6">
              {isReadOnly ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  You do not have create/update permission for this module.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <CrudSelectField
                  label="Audit Entity"
                  value={form.audit_entity_id}
                  required
                  disabled={isMasterLoading}
                  className="md:col-span-2"
                  options={[
                    {
                      value: "",
                      label: isMasterLoading
                        ? "Loading entities..."
                        : "Select entity",
                    },
                    ...auditEntities.map((entity) => ({
                      value: String(entity.id),
                      label: `${entity.entity_name} (${entity.entity_code})`,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      audit_entity_id: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Director / Owner Type"
                  value={form.director_type_id}
                  required
                  disabled={isMasterLoading}
                  options={[
                    { value: "", label: "Select type" },
                    ...directorTypes.map((type) => ({
                      value: String(type.id),
                      label: type.director_type_name,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      director_type_id: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Person Name"
                  value={form.person_name}
                  required
                  placeholder="Example: Mr. Rahman"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      person_name: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Designation"
                  value={form.designation}
                  placeholder="Example: Managing Director"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      designation: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Ownership %"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.ownership_percentage}
                  placeholder="Example: 25.00"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      ownership_percentage: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Nationality"
                  value={form.nationality}
                  placeholder="Bangladeshi"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      nationality: value,
                    }))
                  }
                />

                <CrudTextField
                  label="NID No"
                  value={form.nid_no}
                  placeholder="NID number"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      nid_no: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Passport No"
                  value={form.passport_no}
                  placeholder="Passport number"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      passport_no: value,
                    }))
                  }
                />

                <CrudTextField
                  label="TIN"
                  value={form.tax_identification_no}
                  placeholder="Tax identification number"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      tax_identification_no: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Date of Birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      date_of_birth: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Appointment Date"
                  type="date"
                  value={form.appointment_date}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      appointment_date: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Resignation Date"
                  type="date"
                  value={form.resignation_date}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      resignation_date: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Father Name"
                  value={form.father_name}
                  placeholder="Father name"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      father_name: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Mother Name"
                  value={form.mother_name}
                  placeholder="Mother name"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      mother_name: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Spouse Name"
                  value={form.spouse_name}
                  placeholder="Spouse name"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      spouse_name: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Email"
                  type="email"
                  value={form.email}
                  placeholder="name@example.com"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      email: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Mobile"
                  type="tel"
                  value={form.mobile}
                  placeholder="Example: 017..."
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      mobile: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  placeholder="Office phone"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Primary"
                  value={form.is_primary ? "yes" : "no"}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_primary: value === "yes",
                    }))
                  }
                />

                <CrudSelectField
                  label="Signatory"
                  value={form.is_signatory ? "yes" : "no"}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_signatory: value === "yes",
                    }))
                  }
                />

                <CrudSelectField
                  label="Beneficial Owner"
                  value={form.is_beneficial_owner ? "yes" : "no"}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_beneficial_owner: value === "yes",
                    }))
                  }
                />

                <CrudTextAreaField
                  label="Address"
                  value={form.address}
                  rows={3}
                  placeholder="Personal / office address"
                  className="md:col-span-2"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      address: value,
                    }))
                  }
                />

                <CrudTextAreaField
                  label="Remarks"
                  value={form.remarks}
                  rows={3}
                  placeholder="Optional remarks"
                  className="md:col-span-2"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      remarks: value,
                    }))
                  }
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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


