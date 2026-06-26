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
  Loader2,
  MapPin,
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
  createAuditEntityAddress,
  deactivateAuditEntityAddress,
  listAuditEntityAddresses,
  listAuditEntityAddressTypes,
  permanentDeleteAuditEntityAddress,
  restoreAuditEntityAddress,
  updateAuditEntityAddress,
  type AuditEntityAddress,
  type AuditEntityAddressPayload,
  type AuditEntityAddressType,
} from "@/services/auditEntityAddress";

type StatusFilter = "all" | "active" | "inactive";
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type FormState = {
  audit_entity_id: string;
  address_type_id: string;
  address_line1: string;
  address_line2: string;
  division_code: string;
  district_code: string;
  upazila_code: string;
  union_code: string;
  post_code: string;
  city: string;
  state_region: string;
  country: string;
  is_primary: boolean;
  remarks: string;
};

const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

const initialForm: FormState = {
  audit_entity_id: "",
  address_type_id: "",
  address_line1: "",
  address_line2: "",
  division_code: "",
  district_code: "",
  upazila_code: "",
  union_code: "",
  post_code: "",
  city: "",
  state_region: "",
  country: "Bangladesh",
  is_primary: false,
  remarks: "",
};

function cleanText(value: string) {
  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function toOptionalNumber(value: string) {
  if (!value) return undefined;

  return Number(value);
}

function toFormState(address: AuditEntityAddress): FormState {
  return {
    audit_entity_id: String(address.audit_entity_id),
    address_type_id: String(address.address_type_id),
    address_line1: address.address_line1 ?? "",
    address_line2: address.address_line2 ?? "",
    division_code: address.division_code ?? "",
    district_code: address.district_code ?? "",
    upazila_code: address.upazila_code ?? "",
    union_code: address.union_code ?? "",
    post_code: address.post_code ?? "",
    city: address.city ?? "",
    state_region: address.state_region ?? "",
    country: address.country ?? "",
    is_primary: address.is_primary,
    remarks: address.remarks ?? "",
  };
}

export default function AuditEntityAddressesPage() {
  const actions = useModuleActions("audit_entity_address");

  const [addresses, setAddresses] = useState<AuditEntityAddress[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [addressTypes, setAddressTypes] = useState<AuditEntityAddressType[]>(
    [],
  );
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityFilter, setEntityFilter] = useState("");
  const [addressTypeFilter, setAddressTypeFilter] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedAddress, setSelectedAddress] =
    useState<AuditEntityAddress | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AuditEntityAddress | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : pageSize;

  const entityById = useMemo(() => {
    return new Map(auditEntities.map((entity) => [entity.id, entity]));
  }, [auditEntities]);

  const addressTypeById = useMemo(() => {
    return new Map(addressTypes.map((type) => [type.id, type]));
  }, [addressTypes]);

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
      const [entityResponse, addressTypeResponse] = await Promise.all([
        listAuditEntities({
          page: 1,
          pageSize: 100,
          isActive: true,
          sortBy: "entity_name",
          sortOrder: "asc",
        }),
        listAuditEntityAddressTypes(true),
      ]);

      setAuditEntities(entityResponse.items);
      setAddressTypes(addressTypeResponse.items);
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

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntityAddresses({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        auditEntityId: toOptionalNumber(entityFilter),
        addressTypeId: toOptionalNumber(addressTypeFilter),
        isPrimary:
          primaryFilter === ""
            ? undefined
            : primaryFilter === "primary",
        sortBy: "id",
        sortOrder: "desc",
      });

      setAddresses(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load addresses.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    addressTypeFilter,
    debouncedSearch,
    entityFilter,
    numericPageSize,
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
      void loadAddresses();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadAddresses]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedAddress(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (address: AuditEntityAddress) => {
    setDrawerMode("edit");
    setSelectedAddress(address);
    setForm(toFormState(address));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setIsDrawerOpen(false);
    setSelectedAddress(null);
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

  const handleAddressTypeFilterChange = (value: string) => {
    setAddressTypeFilter(value);
    setPage(1);
  };

  const handlePrimaryFilterChange = (value: string) => {
    setPrimaryFilter(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const buildPayload = (): AuditEntityAddressPayload => {
    return {
      audit_entity_id: Number(form.audit_entity_id),
      address_type_id: Number(form.address_type_id),
      address_line1: cleanText(form.address_line1),
      address_line2: cleanText(form.address_line2),
      division_code: cleanText(form.division_code),
      district_code: cleanText(form.district_code),
      upazila_code: cleanText(form.upazila_code),
      union_code: cleanText(form.union_code),
      post_code: cleanText(form.post_code),
      city: cleanText(form.city),
      state_region: cleanText(form.state_region),
      country: cleanText(form.country),
      is_primary: form.is_primary,
      remarks: cleanText(form.remarks),
    };
  };

  const validateForm = () => {
    if (!form.audit_entity_id) {
      return "Audit entity is required.";
    }

    if (!form.address_type_id) {
      return "Address type is required.";
    }

    if (!form.address_line1.trim() && !form.city.trim()) {
      return "Address line 1 or city is required.";
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
        await createAuditEntityAddress(buildPayload());
        setSuccessMessage("Audit entity address created successfully.");
      } else if (selectedAddress) {
        await updateAuditEntityAddress(selectedAddress.id, buildPayload());
        setSuccessMessage("Audit entity address updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedAddress(null);
      setForm(initialForm);

      await loadAddresses();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save address.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (address: AuditEntityAddress, action: ConfirmAction) => {
    setConfirmTarget(address);
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
        await deactivateAuditEntityAddress(confirmTarget.id);
        setSuccessMessage("Address deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityAddress(confirmTarget.id);
        setSuccessMessage("Address restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityAddress(confirmTarget.id);
        setSuccessMessage("Address permanently deleted successfully.");
      }

      closeConfirm();
      await loadAddresses();
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
                <MapPin className="h-4 w-4" />
                Audit Entity Profile
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                Entity Addresses
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Maintain registered, head office, factory, branch, warehouse
                and communication addresses for audit entities.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </button>
            ) : null}
          </div>
        </div>

        <div className="border-b border-slate-200 px-6 py-4">
          <div className="grid gap-3 lg:grid-cols-[120px_1fr_170px_180px_180px_150px]">
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
                  placeholder="Search address, city, post code..."
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
                Address Type
              </span>
              <select
                value={addressTypeFilter}
                onChange={(event) =>
                  handleAddressTypeFilterChange(event.target.value)
                }
                disabled={isMasterLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
              >
                <option value="">All</option>
                {addressTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.address_type_name}
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
                  handlePrimaryFilterChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
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
                  Address Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location
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
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading addresses...
                    </div>
                  </td>
                </tr>
              ) : addresses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <MapPin className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No addresses found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add address profile for audit entities.
                    </p>
                  </td>
                </tr>
              ) : (
                addresses.map((address) => {
                  const entity = entityById.get(address.audit_entity_id);
                  const addressType = addressTypeById.get(address.address_type_id);
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    address.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !address.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !address.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={address.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity?.entity_name ?? `Entity #${address.audit_entity_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity?.entity_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {addressType?.address_type_name ??
                            `Type #${address.address_type_id}`}
                        </div>
                        {address.is_primary ? (
                          <span className="mt-2 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                            Primary
                          </span>
                        ) : null}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="max-w-md text-sm font-medium text-slate-900">
                          {address.address_line1 ?? "-"}
                        </div>
                        {address.address_line2 ? (
                          <div className="mt-1 max-w-md text-xs text-slate-500">
                            {address.address_line2}
                          </div>
                        ) : null}
                        <div className="mt-1 text-xs text-slate-500">
                          Post Code: {address.post_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {address.city ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {address.state_region ?? "-"}, {address.country ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          District: {address.district_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            address.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {address.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(address)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(address, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(address, "restore")}
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
                                openConfirm(address, "permanent_delete")
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
                    ? "Create Entity Address"
                    : "Edit Entity Address"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  One entity can keep multiple addresses by address type.
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
                    Address Type <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.address_type_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address_type_id: event.target.value,
                      }))
                    }
                    disabled={isMasterLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  >
                    <option value="">Select address type</option>
                    {addressTypes.map((type) => (
                      <option key={type.id} value={String(type.id)}>
                        {type.address_type_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Primary Status
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

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Address Line 1
                  </span>
                  <textarea
                    value={form.address_line1}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address_line1: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="House, road, area, building, floor..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Address Line 2
                  </span>
                  <textarea
                    value={form.address_line2}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address_line2: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Additional address details"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Division Code
                  </span>
                  <input
                    value={form.division_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        division_code: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    District Code
                  </span>
                  <input
                    value={form.district_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        district_code: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Upazila Code
                  </span>
                  <input
                    value={form.upazila_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        upazila_code: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Union Code
                  </span>
                  <input
                    value={form.union_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        union_code: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Post Code
                  </span>
                  <input
                    value={form.post_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        post_code: event.target.value,
                      }))
                    }
                    placeholder="Example: 1212"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    City
                  </span>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    placeholder="Example: Dhaka"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    State / Region
                  </span>
                  <input
                    value={form.state_region}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        state_region: event.target.value,
                      }))
                    }
                    placeholder="Example: Dhaka Division"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Country
                  </span>
                  <input
                    value={form.country}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        country: event.target.value,
                      }))
                    }
                    placeholder="Bangladesh"
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
                  this address?
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

