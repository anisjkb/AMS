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
  CalendarClock,
  CheckCircle2,
  Factory,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import { listAuditEntities, type AuditEntity } from "@/services/auditEntity";
import {
  createAuditEntityFacility,
  deactivateAuditEntityFacility,
  listAuditEntityFacilities,
  listAuditEntityFacilityTypes,
  permanentDeleteAuditEntityFacility,
  restoreAuditEntityFacility,
  updateAuditEntityFacility,
  type AuditEntityFacility,
  type AuditEntityFacilityOwnershipType,
  type AuditEntityFacilityPayload,
  type AuditEntityFacilityStatus,
  type AuditEntityFacilityType,
} from "@/services/auditEntityFacility";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";
type BooleanFilter = "" | "yes" | "no";

type FormState = {
  audit_entity_id: string;
  facility_type_id: string;
  facility_code: string;
  facility_name: string;
  facility_status: AuditEntityFacilityStatus;
  ownership_type: "" | AuditEntityFacilityOwnershipType;
  registration_no: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  division_code: string;
  district_code: string;
  upazila_code: string;
  post_code: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  floor_area_sqft: string;
  production_capacity: string;
  number_of_employees: string;
  opening_date: string;
  closing_date: string;
  is_primary: boolean;
  is_operational: boolean;
  description: string;
  remarks: string;
};

const facilityStatusOptions: {
  value: AuditEntityFacilityStatus;
  label: string;
}[] = [
  { value: "operational", label: "Operational" },
  { value: "under_construction", label: "Under Construction" },
  { value: "temporarily_closed", label: "Temporarily Closed" },
  { value: "closed", label: "Closed" },
  { value: "inactive", label: "Inactive" },
];

const ownershipTypeOptions: {
  value: AuditEntityFacilityOwnershipType;
  label: string;
}[] = [
  { value: "owned", label: "Owned" },
  { value: "rented", label: "Rented" },
  { value: "leased", label: "Leased" },
  { value: "third_party", label: "Third Party" },
  { value: "shared", label: "Shared" },
  { value: "other", label: "Other" },
];

const initialForm: FormState = {
  audit_entity_id: "",
  facility_type_id: "",
  facility_code: "",
  facility_name: "",
  facility_status: "operational",
  ownership_type: "",
  registration_no: "",
  contact_person: "",
  contact_email: "",
  contact_phone: "",
  address_line1: "",
  address_line2: "",
  division_code: "",
  district_code: "",
  upazila_code: "",
  post_code: "",
  city: "",
  country: "Bangladesh",
  latitude: "",
  longitude: "",
  floor_area_sqft: "",
  production_capacity: "",
  number_of_employees: "",
  opening_date: "",
  closing_date: "",
  is_primary: false,
  is_operational: true,
  description: "",
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

function cleanInteger(value: string) {
  const cleaned = value.trim();

  if (!cleaned) return null;

  return Number.parseInt(cleaned, 10);
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

function getFacilityStatusLabel(value: string) {
  return (
    facilityStatusOptions.find((option) => option.value === value)?.label ??
    value
  );
}

function getOwnershipTypeLabel(value: string | null) {
  if (!value) return "-";

  return (
    ownershipTypeOptions.find((option) => option.value === value)?.label ??
    value
  );
}

function getFacilityStatusClass(value: string) {
  if (value === "operational") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "under_construction") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "temporarily_closed") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "closed") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function formatNumber(value: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";

  return Number(value).toLocaleString();
}

function toFormState(facility: AuditEntityFacility): FormState {
  return {
    audit_entity_id: String(facility.audit_entity_id),
    facility_type_id: String(facility.facility_type_id),
    facility_code: facility.facility_code ?? "",
    facility_name: facility.facility_name,
    facility_status: facility.facility_status,
    ownership_type: facility.ownership_type ?? "",
    registration_no: facility.registration_no ?? "",
    contact_person: facility.contact_person ?? "",
    contact_email: facility.contact_email ?? "",
    contact_phone: facility.contact_phone ?? "",
    address_line1: facility.address_line1 ?? "",
    address_line2: facility.address_line2 ?? "",
    division_code: facility.division_code ?? "",
    district_code: facility.district_code ?? "",
    upazila_code: facility.upazila_code ?? "",
    post_code: facility.post_code ?? "",
    city: facility.city ?? "",
    country: facility.country ?? "",
    latitude:
      facility.latitude === null || facility.latitude === undefined
        ? ""
        : String(facility.latitude),
    longitude:
      facility.longitude === null || facility.longitude === undefined
        ? ""
        : String(facility.longitude),
    floor_area_sqft:
      facility.floor_area_sqft === null ||
      facility.floor_area_sqft === undefined
        ? ""
        : String(facility.floor_area_sqft),
    production_capacity: facility.production_capacity ?? "",
    number_of_employees:
      facility.number_of_employees === null ||
      facility.number_of_employees === undefined
        ? ""
        : String(facility.number_of_employees),
    opening_date: facility.opening_date ?? "",
    closing_date: facility.closing_date ?? "",
    is_primary: facility.is_primary,
    is_operational: facility.is_operational,
    description: facility.description ?? "",
    remarks: facility.remarks ?? "",
  };
}

export default function AuditEntityFacilitiesPage() {
  const actions = useModuleActions("audit_entity_facility");

  const [facilities, setFacilities] = useState<AuditEntityFacility[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [facilityTypes, setFacilityTypes] = useState<AuditEntityFacilityType[]>(
    [],
  );
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityFilter, setEntityFilter] = useState("");
  const [facilityTypeFilter, setFacilityTypeFilter] = useState("");
  const [facilityStatusFilter, setFacilityStatusFilter] = useState("");
  const [ownershipTypeFilter, setOwnershipTypeFilter] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState<BooleanFilter>("");
  const [operationalFilter, setOperationalFilter] = useState<BooleanFilter>("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedFacility, setSelectedFacility] =
    useState<AuditEntityFacility | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AuditEntityFacility | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

  const entityById = useMemo(() => {
    return new Map(auditEntities.map((entity) => [entity.id, entity]));
  }, [auditEntities]);

  const facilityTypeById = useMemo(() => {
    return new Map(facilityTypes.map((type) => [type.id, type]));
  }, [facilityTypes]);

  const totalPages = useMemo(() => {
    if (totalRecords === 0) return 1;

    return Math.max(1, Math.ceil(totalRecords / numericPageSize));
  }, [numericPageSize, totalRecords]);


  const isReadOnly = !actions.canCreate && !actions.canUpdate;

  const loadMasterData = useCallback(async () => {
    setIsMasterLoading(true);

    try {
      const [entityResponse, facilityTypeResponse] = await Promise.all([
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "entity_name",
          sortOrder: "asc",
        }),
        listAuditEntityFacilityTypes(true),
      ]);

      setAuditEntities(entityResponse.items);
      setFacilityTypes(facilityTypeResponse.items);
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

  const loadFacilities = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntityFacilities({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        auditEntityId: toOptionalNumber(entityFilter),
        facilityTypeId: toOptionalNumber(facilityTypeFilter),
        facilityStatus:
          facilityStatusFilter === ""
            ? undefined
            : (facilityStatusFilter as AuditEntityFacilityStatus),
        ownershipType:
          ownershipTypeFilter === ""
            ? undefined
            : (ownershipTypeFilter as AuditEntityFacilityOwnershipType),
        isPrimary: toBooleanFilter(primaryFilter),
        isOperational: toBooleanFilter(operationalFilter),
        sortBy: "id",
        sortOrder: "desc",
      });

      setFacilities(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load facilities.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    entityFilter,
    facilityStatusFilter,
    facilityTypeFilter,
    numericPageSize,
    operationalFilter,
    ownershipTypeFilter,
    page,
    primaryFilter,
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
      void loadFacilities();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadFacilities]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedFacility(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (facility: AuditEntityFacility) => {
    setDrawerMode("edit");
    setSelectedFacility(facility);
    setForm(toFormState(facility));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setErrorMessage("");
    setSuccessMessage("");

    setIsDrawerOpen(false);
    setSelectedFacility(null);
    setForm(initialForm);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value as CrudPageSizeOption);
    setPage(1);
  };

  const buildPayload = (): AuditEntityFacilityPayload => {
    return {
      audit_entity_id: Number(form.audit_entity_id),
      facility_type_id: Number(form.facility_type_id),
      facility_code: cleanText(form.facility_code),
      facility_name: form.facility_name.trim(),
      facility_status: form.facility_status,
      ownership_type:
        form.ownership_type === "" ? null : form.ownership_type,
      registration_no: cleanText(form.registration_no),
      contact_person: cleanText(form.contact_person),
      contact_email: cleanText(form.contact_email),
      contact_phone: cleanText(form.contact_phone),
      address_line1: cleanText(form.address_line1),
      address_line2: cleanText(form.address_line2),
      division_code: cleanText(form.division_code),
      district_code: cleanText(form.district_code),
      upazila_code: cleanText(form.upazila_code),
      post_code: cleanText(form.post_code),
      city: cleanText(form.city),
      country: cleanText(form.country),
      latitude: cleanNumber(form.latitude),
      longitude: cleanNumber(form.longitude),
      floor_area_sqft: cleanNumber(form.floor_area_sqft),
      production_capacity: cleanText(form.production_capacity),
      number_of_employees: cleanInteger(form.number_of_employees),
      opening_date: cleanDate(form.opening_date),
      closing_date: cleanDate(form.closing_date),
      is_primary: form.is_primary,
      is_operational: form.is_operational,
      description: cleanText(form.description),
      remarks: cleanText(form.remarks),
    };
  };

  const validateForm = () => {
    if (!form.audit_entity_id) {
      return "Audit entity is required.";
    }

    if (!form.facility_type_id) {
      return "Facility type is required.";
    }

    if (!form.facility_name.trim()) {
      return "Facility name is required.";
    }

    if (
      form.opening_date &&
      form.closing_date &&
      form.closing_date < form.opening_date
    ) {
      return "Closing date cannot be earlier than opening date.";
    }

    const latitude = cleanNumber(form.latitude);
    const longitude = cleanNumber(form.longitude);
    const floorArea = cleanNumber(form.floor_area_sqft);
    const employees = cleanInteger(form.number_of_employees);

    if (latitude !== null && (Number.isNaN(latitude) || latitude < -90 || latitude > 90)) {
      return "Latitude must be between -90 and 90.";
    }

    if (
      longitude !== null &&
      (Number.isNaN(longitude) || longitude < -180 || longitude > 180)
    ) {
      return "Longitude must be between -180 and 180.";
    }

    if (floorArea !== null && (Number.isNaN(floorArea) || floorArea < 0)) {
      return "Floor area cannot be negative.";
    }

    if (employees !== null && (Number.isNaN(employees) || employees < 0)) {
      return "Number of employees cannot be negative.";
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
        await createAuditEntityFacility(buildPayload());
        setSuccessMessage("Facility/factory created successfully.");
      } else if (selectedFacility) {
        await updateAuditEntityFacility(selectedFacility.id, buildPayload());
        setSuccessMessage("Facility/factory updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedFacility(null);
      setForm(initialForm);

      await loadFacilities();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save facility.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (
    facility: AuditEntityFacility,
    action: ConfirmAction,
  ) => {
    setConfirmTarget(facility);
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
        await deactivateAuditEntityFacility(confirmTarget.id);
        setSuccessMessage("Facility/factory deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityFacility(confirmTarget.id);
        setSuccessMessage("Facility/factory restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityFacility(confirmTarget.id);
        setSuccessMessage("Facility/factory permanently deleted successfully.");
      }

      closeConfirm();
      await loadFacilities();
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
                <Factory className="h-4 w-4" />
                Audit Entity Profile
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                Facilities / Factories
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Maintain factories, plants, warehouses, project sites, service
                centers and other operating facilities of audit entities.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add Facility
              </button>
            ) : null}
          </div>
        </div>

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={() => void loadFacilities()}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setEntityFilter("");
            setFacilityTypeFilter("");
            setFacilityStatusFilter("");
            setOwnershipTypeFilter("");
            setPrimaryFilter("");
            setOperationalFilter("");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            setPage(1);
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search facility, city, contact, capacity...",
              onChange: (value) => {
                setSearch(value);
                setPage(1);
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
                setPage(1);
              },
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
              onChange: (value) => {
                setEntityFilter(value);
                setPage(1);
              },
            },
            {
              key: "facility_type",
              label: "Facility Type",
              type: "select",
              value: facilityTypeFilter,
              disabled: isMasterLoading,
              options: [
                { value: "", label: "All" },
                ...facilityTypes.map((type) => ({
                  value: String(type.id),
                  label: type.facility_type_name,
                })),
              ],
              onChange: (value) => {
                setFacilityTypeFilter(value);
                setPage(1);
              },
            },
            {
              key: "facility_status",
              label: "Facility Status",
              type: "select",
              value: facilityStatusFilter,
              options: [
                { value: "", label: "All" },
                ...facilityStatusOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ],
              onChange: (value) => {
                setFacilityStatusFilter(value);
                setPage(1);
              },
            },
            {
              key: "ownership",
              label: "Ownership",
              type: "select",
              value: ownershipTypeFilter,
              options: [
                { value: "", label: "All" },
                ...ownershipTypeOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ],
              onChange: (value) => {
                setOwnershipTypeFilter(value);
                setPage(1);
              },
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
              onChange: (value) => {
                setPrimaryFilter(value as BooleanFilter);
                setPage(1);
              },
            },
            {
              key: "operational",
              label: "Operational",
              type: "select",
              value: operationalFilter,
              options: [
                { value: "", label: "All" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ],
              onChange: (value) => {
                setOperationalFilter(value as BooleanFilter);
                setPage(1);
              },
            },
          ]}
        />

        {errorMessage && !isDrawerOpen ? (
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
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Operation
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
                      Loading facilities...
                    </div>
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <Factory className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No facilities found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add factory, plant, warehouse or project site.
                    </p>
                  </td>
                </tr>
              ) : (
                facilities.map((facility) => {
                  const entity = entityById.get(facility.audit_entity_id);
                  const facilityType = facilityTypeById.get(
                    facility.facility_type_id,
                  );
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    facility.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !facility.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !facility.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={facility.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity?.entity_name ??
                            `Entity #${facility.audit_entity_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity?.entity_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {facility.facility_name}
                        </div>
                        <div className="mt-1 text-sm text-slate-700">
                          {facilityType?.facility_type_name ??
                            `Type #${facility.facility_type_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Code: {facility.facility_code ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Reg No: {facility.registration_no ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {facility.city ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {facility.address_line1 ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Country: {facility.country ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {facility.contact_person ?? "-"}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {facility.contact_email ?? "-"}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {facility.contact_phone ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                          Open: {facility.opening_date ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Employees:{" "}
                          {facility.number_of_employees?.toLocaleString() ??
                            "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Area: {formatNumber(facility.floor_area_sqft)} sqft
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Capacity: {facility.production_capacity ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {facility.is_primary ? (
                            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              Primary
                            </span>
                          ) : null}

                          {facility.is_operational ? (
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              Operational
                            </span>
                          ) : null}

                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {getOwnershipTypeLabel(facility.ownership_type)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getFacilityStatusClass(
                              facility.facility_status,
                            )}`}
                          >
                            {getFacilityStatusLabel(facility.facility_status)}
                          </span>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                facility.is_active
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {facility.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(facility)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(facility, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(facility, "restore")}
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
                                openConfirm(facility, "permanent_delete")
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
        title={
          drawerMode === "create"
            ? "Create Facility / Factory"
            : "Edit Facility / Factory"
        }
        description="Keep facility identity, location, contact and operation details."
        maxWidthClassName="max-w-5xl"
        footer={
          <>
            <button
              type="button"
              onClick={closeDrawer}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="facility-form"
              disabled={isSaving || isReadOnly}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Save Facility
            </button>
          </>
        }
      >
            <form id="facility-form" onSubmit={handleSubmit} className="space-y-6">
              {isReadOnly ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  You do not have create/update permission for this module.
                </div>
              ) : null}

              {/* Drawer form validation/error message */}
              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
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
                  label="Facility Type"
                  value={form.facility_type_id}
                  required
                  disabled={isMasterLoading}
                  options={[
                    { value: "", label: "Select facility type" },
                    ...facilityTypes.map((type) => ({
                      value: String(type.id),
                      label: type.facility_type_name,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      facility_type_id: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Facility Name"
                  value={form.facility_name}
                  required
                  placeholder="Example: Gazipur Factory"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      facility_name: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Facility Code"
                  value={form.facility_code}
                  placeholder="Example: FAC-001"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      facility_code: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Facility Status"
                  value={form.facility_status}
                  options={facilityStatusOptions}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      facility_status: value as AuditEntityFacilityStatus,
                    }))
                  }
                />

                <CrudSelectField
                  label="Ownership Type"
                  value={form.ownership_type}
                  options={[
                    { value: "", label: "Select ownership" },
                    ...ownershipTypeOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      ownership_type:
                        value as "" | AuditEntityFacilityOwnershipType,
                    }))
                  }
                />

                <CrudTextField
                  label="Registration No"
                  value={form.registration_no}
                  placeholder="Factory / facility registration no"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      registration_no: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Contact Person"
                  value={form.contact_person}
                  placeholder="Facility contact person"
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
                  placeholder="facility@example.com"
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
                  placeholder="Facility phone"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      contact_phone: value,
                    }))
                  }
                />

                <CrudTextAreaField
                  label="Address Line 1"
                  value={form.address_line1}
                  rows={2}
                  placeholder="Main address"
                  className="md:col-span-2"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      address_line1: value,
                    }))
                  }
                />

                <CrudTextAreaField
                  label="Address Line 2"
                  value={form.address_line2}
                  rows={2}
                  placeholder="Additional address"
                  className="md:col-span-2"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      address_line2: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Division Code"
                  value={form.division_code}
                  placeholder="Division code"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      division_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="District Code"
                  value={form.district_code}
                  placeholder="District code"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      district_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Upazila Code"
                  value={form.upazila_code}
                  placeholder="Upazila code"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      upazila_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Post Code"
                  value={form.post_code}
                  placeholder="Post code"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      post_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="City"
                  value={form.city}
                  placeholder="City"
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
                  placeholder="Bangladesh"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      country: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Latitude"
                  type="number"
                  step="0.0000001"
                  value={form.latitude}
                  placeholder="Example: 23.8103310"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      latitude: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Longitude"
                  type="number"
                  step="0.0000001"
                  value={form.longitude}
                  placeholder="Example: 90.4125210"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      longitude: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Floor Area Sqft"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.floor_area_sqft}
                  placeholder="Example: 50000"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      floor_area_sqft: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Number of Employees"
                  type="number"
                  min="0"
                  value={form.number_of_employees}
                  placeholder="Example: 500"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      number_of_employees: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Production Capacity"
                  value={form.production_capacity}
                  placeholder="Example: 100,000 units per month"
                  className="md:col-span-2"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      production_capacity: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Opening Date"
                  type="date"
                  value={form.opening_date}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      opening_date: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Closing Date"
                  type="date"
                  value={form.closing_date}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      closing_date: value,
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
                  label="Operational"
                  value={form.is_operational ? "yes" : "no"}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_operational: value === "yes",
                    }))
                  }
                />

                <CrudTextAreaField
                  label="Description"
                  value={form.description}
                  rows={3}
                  placeholder="Facility description"
                  className="md:col-span-2"
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
                  this facility/factory?
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


