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
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
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
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
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

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

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

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={loadAddresses}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setEntityFilter("");
            setAddressTypeFilter("");
            setPrimaryFilter("");
            setPageSize(DEFAULT_CRUD_PAGE_SIZE);
            setPage(1);
          }}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search address, city, post code...",
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
              key: "addressType",
              label: "Address Type",
              type: "select",
              value: addressTypeFilter,
              disabled: isMasterLoading,
              options: [
                { value: "", label: "All" },
                ...addressTypes.map((type) => ({
                  value: String(type.id),
                  label: type.address_type_name,
                })),
              ],
              onChange: handleAddressTypeFilterChange,
            },
            {
              key: "primary",
              label: "Primary",
              type: "select",
              value: primaryFilter,
              options: [
                { value: "", label: "All" },
                { value: "primary", label: "Primary" },
                { value: "secondary", label: "Secondary" },
              ],
              onChange: handlePrimaryFilterChange,
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
        title={drawerMode === "create" ? "Create Address" : "Edit Address"}
        description="Keep registered, mailing and operational address information for audit entities."
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
              form="entity-address-form"
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
        <form id="entity-address-form" onSubmit={handleSubmit} className="space-y-6">
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
                  label="Address Type"
                  value={form.address_type_id}
                  required
                  disabled={isMasterLoading}
                  options={[
                    { value: "", label: "Select address type" },
                    ...addressTypes.map((type) => ({
                      value: String(type.id),
                      label: type.address_type_name,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      address_type_id: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Primary Status"
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

                <CrudTextAreaField
                  label="Address Line 1"
                  value={form.address_line1}
                  rows={3}
                  placeholder="House, road, area, building, floor..."
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
                  placeholder="Additional address details"
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
                  placeholder="Optional"
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
                  placeholder="Optional"
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
                  placeholder="Optional"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      upazila_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Union Code"
                  value={form.union_code}
                  placeholder="Optional"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      union_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Post Code"
                  value={form.post_code}
                  placeholder="Example: 1212"
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
                  placeholder="Example: Dhaka"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      city: value,
                    }))
                  }
                />

                <CrudTextField
                  label="State / Region"
                  value={form.state_region}
                  placeholder="Example: Dhaka Division"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      state_region: value,
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


