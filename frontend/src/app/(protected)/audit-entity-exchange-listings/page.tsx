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
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import {
  listAuditEntities,
  type AuditEntity,
} from "@/services/auditEntity";
import {
  createAuditEntityExchangeListing,
  deactivateAuditEntityExchangeListing,
  listAuditEntityExchangeListings,
  permanentDeleteAuditEntityExchangeListing,
  restoreAuditEntityExchangeListing,
  updateAuditEntityExchangeListing,
  type AuditEntityExchangeListing,
  type AuditEntityExchangeListingPayload,
} from "@/services/auditEntityExchangeListing";

type StatusFilter = "all" | "active" | "inactive";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";

type FormState = {
  audit_entity_id: string;
  listing_code: string;
  stock_exchange: string;
  trading_code: string;
  scrip_code: string;
  isin_code: string;
  market_category: string;
  listed_sector: string;
  listing_date: string;
  listing_status: string;
  is_primary_listing: boolean;
  remarks: string;
};

const stockExchangeOptions = [
  { value: "none", label: "None / Unlisted" },
  { value: "dse", label: "DSE" },
  { value: "cse", label: "CSE" },
  { value: "other", label: "Other" },
];

const listingStatusOptions = [
  { value: "unlisted", label: "Unlisted" },
  { value: "listed", label: "Listed" },
  { value: "suspended", label: "Suspended" },
  { value: "delisted", label: "Delisted" },
];

const marketCategoryOptions = [
  "A",
  "B",
  "G",
  "N",
  "Z",
  "Main Market",
  "SME",
  "ATB",
];

const initialForm: FormState = {
  audit_entity_id: "",
  listing_code: "",
  stock_exchange: "none",
  trading_code: "",
  scrip_code: "",
  isin_code: "",
  market_category: "",
  listed_sector: "",
  listing_date: "",
  listing_status: "unlisted",
  is_primary_listing: false,
  remarks: "",
};

function cleanText(value: string) {
  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return value;
}

function toTitle(value: string | null) {
  if (!value) return "-";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusBadgeClass(value: string) {
  if (value === "listed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "unlisted") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }

  if (value === "suspended") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

function toFormState(listing: AuditEntityExchangeListing): FormState {
  return {
    audit_entity_id: String(listing.audit_entity_id),
    listing_code: listing.listing_code,
    stock_exchange: listing.stock_exchange,
    trading_code: listing.trading_code ?? "",
    scrip_code: listing.scrip_code ?? "",
    isin_code: listing.isin_code ?? "",
    market_category: listing.market_category ?? "",
    listed_sector: listing.listed_sector ?? "",
    listing_date: listing.listing_date ?? "",
    listing_status: listing.listing_status,
    is_primary_listing: listing.is_primary_listing,
    remarks: listing.remarks ?? "",
  };
}

export default function AuditEntityExchangeListingsPage() {
  const actions = useModuleActions("audit_entity_exchange_listing");

  const [listings, setListings] = useState<AuditEntityExchangeListing[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stockExchangeFilter, setStockExchangeFilter] = useState("");
  const [listingStatusFilter, setListingStatusFilter] = useState("");
  const [primaryFilter, setPrimaryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedListing, setSelectedListing] =
    useState<AuditEntityExchangeListing | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AuditEntityExchangeListing | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

  const entityById = useMemo(() => {
    return new Map(auditEntities.map((entity) => [entity.id, entity]));
  }, [auditEntities]);

  const totalPages = useMemo(() => {
    if (totalRecords === 0) return 1;

    return Math.max(1, Math.ceil(totalRecords / numericPageSize));
  }, [numericPageSize, totalRecords]);


  const isReadOnly = !actions.canCreate && !actions.canUpdate;

  const loadMasterData = useCallback(async () => {
    setIsMasterLoading(true);

    try {
      const response = await listAuditEntities({
        page: 1,
        pageSize: 100,
        isActive: true,
        sortBy: "entity_name",
        sortOrder: "asc",
      });

      setAuditEntities(response.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load audit entities.",
      );
    } finally {
      setIsMasterLoading(false);
    }
  }, []);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntityExchangeListings({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        stockExchange: stockExchangeFilter || undefined,
        listingStatus: listingStatusFilter || undefined,
        isPrimaryListing:
          primaryFilter === ""
            ? undefined
            : primaryFilter === "primary",
        sortBy: "id",
        sortOrder: "desc",
      });

      setListings(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load exchange listings.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    listingStatusFilter,
    numericPageSize,
    page,
    primaryFilter,
    statusFilter,
    stockExchangeFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadMasterData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadMasterData]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadListings();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadListings]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedListing(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (listing: AuditEntityExchangeListing) => {
    setDrawerMode("edit");
    setSelectedListing(listing);
    setForm(toFormState(listing));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setIsDrawerOpen(false);
    setSelectedListing(null);
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

  const handleStockExchangeFilterChange = (value: string) => {
    setStockExchangeFilter(value);
    setPage(1);
  };

  const handleListingStatusFilterChange = (value: string) => {
    setListingStatusFilter(value);
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

  const handleStockExchangeChange = (value: string) => {
    setForm((current) => {
      if (value === "none") {
        return {
          ...current,
          stock_exchange: "none",
          listing_status: "unlisted",
          trading_code: "",
          scrip_code: "",
          isin_code: "",
          market_category: "",
          listed_sector: "",
          listing_date: "",
        };
      }

      return {
        ...current,
        stock_exchange: value,
        listing_status:
          current.listing_status === "unlisted" ? "listed" : current.listing_status,
      };
    });
  };

  const handleListingStatusChange = (value: string) => {
    setForm((current) => {
      if (value === "unlisted") {
        return {
          ...current,
          stock_exchange: "none",
          listing_status: "unlisted",
          trading_code: "",
          scrip_code: "",
          isin_code: "",
          market_category: "",
          listed_sector: "",
          listing_date: "",
        };
      }

      return {
        ...current,
        listing_status: value,
        stock_exchange:
          current.stock_exchange === "none" ? "dse" : current.stock_exchange,
      };
    });
  };

  const buildPayload = (): AuditEntityExchangeListingPayload => {
    return {
      audit_entity_id: Number(form.audit_entity_id),
      listing_code: cleanText(form.listing_code),
      stock_exchange: form.stock_exchange,
      trading_code: cleanText(form.trading_code),
      scrip_code: cleanText(form.scrip_code),
      isin_code: cleanText(form.isin_code),
      market_category: cleanText(form.market_category),
      listed_sector: cleanText(form.listed_sector),
      listing_date: cleanText(form.listing_date),
      listing_status: form.listing_status,
      is_primary_listing: form.is_primary_listing,
      remarks: cleanText(form.remarks),
    };
  };

  const validateForm = () => {
    if (!form.audit_entity_id) {
      return "Audit entity is required.";
    }

    if (form.listing_status === "unlisted" && form.stock_exchange !== "none") {
      return "Unlisted company must use stock exchange: none.";
    }

    if (form.stock_exchange === "none" && form.listing_status !== "unlisted") {
      return "Stock exchange none can only be used for unlisted status.";
    }

    if (
      ["dse", "cse"].includes(form.stock_exchange) &&
      !form.trading_code.trim()
    ) {
      return "Trading code is required for DSE or CSE record.";
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
        await createAuditEntityExchangeListing(buildPayload());
        setSuccessMessage("Exchange listing created successfully.");
      } else if (selectedListing) {
        await updateAuditEntityExchangeListing(
          selectedListing.id,
          buildPayload(),
        );
        setSuccessMessage("Exchange listing updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedListing(null);
      setForm(initialForm);

      await loadListings();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save exchange listing.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (
    listing: AuditEntityExchangeListing,
    action: ConfirmAction,
  ) => {
    setConfirmTarget(listing);
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
        await deactivateAuditEntityExchangeListing(confirmTarget.id);
        setSuccessMessage("Exchange listing deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityExchangeListing(confirmTarget.id);
        setSuccessMessage("Exchange listing restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityExchangeListing(confirmTarget.id);
        setSuccessMessage("Exchange listing permanently deleted successfully.");
      }

      closeConfirm();
      await loadListings();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to complete action.",
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
                Audit Entity Exchange Listings
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Track listed, unlisted, suspended and delisted capital market
                status for each audit entity.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add Listing
              </button>
            ) : null}
          </div>
        </div>

        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={loadListings}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
            setStockExchangeFilter("");
            setListingStatusFilter("");
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
              placeholder: "Search code, trading code, ISIN, category...",
              onChange: handleSearchChange,
            },
            {
              key: "status",
              label: "Active Status",
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
              key: "exchange",
              label: "Exchange",
              type: "select",
              value: stockExchangeFilter,
              options: [
                { value: "", label: "All" },
                ...stockExchangeOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ],
              onChange: handleStockExchangeFilterChange,
            },
            {
              key: "listingStatus",
              label: "Listing Status",
              type: "select",
              value: listingStatusFilter,
              options: [
                { value: "", label: "All" },
                ...listingStatusOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ],
              onChange: handleListingStatusFilterChange,
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
                  Exchange
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Trading / Scrip
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active
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
                      Loading exchange listings...
                    </div>
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No exchange listings found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add listed or unlisted status for audit entities.
                    </p>
                  </td>
                </tr>
              ) : (
                listings.map((listing) => {
                  const entity = entityById.get(listing.audit_entity_id);
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    listing.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !listing.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !listing.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={listing.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity?.entity_name ?? `Entity #${listing.audit_entity_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {listing.listing_code}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium uppercase text-slate-800">
                          {listing.stock_exchange === "none"
                            ? "None"
                            : listing.stock_exchange}
                        </div>
                        {listing.is_primary_listing ? (
                          <span className="mt-1 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                            Primary
                          </span>
                        ) : null}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-900">
                          {listing.trading_code ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Scrip: {listing.scrip_code ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          ISIN: {listing.isin_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-900">
                          {listing.market_category ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Sector: {listing.listed_sector ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Date: {formatDate(listing.listing_date)}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            listing.listing_status,
                          )}`}
                        >
                          {toTitle(listing.listing_status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            listing.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {listing.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(listing)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(listing, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(listing, "restore")}
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
                                openConfirm(listing, "permanent_delete")
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
        title={drawerMode === "create" ? "Add Exchange Listing" : "Edit Exchange Listing"}
        description="Add DSE/CSE listing or unlisted capital market status."
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
              form="entity-exchange-listing-form"
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
          id="entity-exchange-listing-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
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

                <CrudTextField
                  label="Listing Code"
                  value={form.listing_code}
                  placeholder="Auto: EXL-0001"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      listing_code: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Primary Status"
                  value={form.is_primary_listing ? "yes" : "no"}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_primary_listing: value === "yes",
                    }))
                  }
                />

                <CrudSelectField
                  label="Listing Status"
                  value={form.listing_status}
                  required
                  options={listingStatusOptions}
                  onChange={handleListingStatusChange}
                />

                <CrudSelectField
                  label="Stock Exchange"
                  value={form.stock_exchange}
                  required
                  options={stockExchangeOptions}
                  onChange={handleStockExchangeChange}
                />

                <CrudTextField
                  label="Trading Code"
                  value={form.trading_code}
                  disabled={form.stock_exchange === "none"}
                  placeholder="Example: SQURPHARMA"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      trading_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Scrip Code"
                  value={form.scrip_code}
                  disabled={form.stock_exchange === "none"}
                  placeholder="Optional"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      scrip_code: value,
                    }))
                  }
                />

                <CrudTextField
                  label="ISIN Code"
                  value={form.isin_code}
                  disabled={form.stock_exchange === "none"}
                  placeholder="Optional"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      isin_code: value,
                    }))
                  }
                />

                <CrudSelectField
                  label="Market Category"
                  value={form.market_category}
                  disabled={form.stock_exchange === "none"}
                  options={[
                    { value: "", label: "Select category" },
                    ...marketCategoryOptions.map((category) => ({
                      value: category,
                      label: category,
                    })),
                  ]}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      market_category: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Listed Sector"
                  value={form.listed_sector}
                  disabled={form.stock_exchange === "none"}
                  placeholder="Example: Pharmaceuticals"
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      listed_sector: value,
                    }))
                  }
                />

                <CrudTextField
                  label="Listing Date"
                  type="date"
                  value={form.listing_date}
                  disabled={form.stock_exchange === "none"}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      listing_date: value,
                    }))
                  }
                />

                <CrudTextAreaField
                  label="Remarks"
                  value={form.remarks}
                  rows={4}
                  placeholder="Example: Unlisted private company"
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
                  this exchange listing?
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

