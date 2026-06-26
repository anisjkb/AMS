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
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useModuleActions } from "@/hooks/useModuleActions";
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
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
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

const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

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
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
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

  const numericPageSize = pageSize === "all" ? 100 : pageSize;

  const entityById = useMemo(() => {
    return new Map(auditEntities.map((entity) => [entity.id, entity]));
  }, [auditEntities]);

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
    setPageSize(value === "all" ? "all" : (Number(value) as PageSizeOption));
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
                  placeholder="Search code, trading code, ISIN, category..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm outline-none transition focus:border-slate-500"
                />
              </div>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Active Status
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
                Exchange
              </span>
              <select
                value={stockExchangeFilter}
                onChange={(event) =>
                  handleStockExchangeFilterChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                {stockExchangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Listing Status
              </span>
              <select
                value={listingStatusFilter}
                onChange={(event) =>
                  handleListingStatusFilterChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                {listingStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {drawerMode === "create"
                    ? "Add Exchange Listing"
                    : "Edit Exchange Listing"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add DSE/CSE listing or unlisted capital market status.
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
                    Listing Code
                  </span>
                  <input
                    value={form.listing_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        listing_code: event.target.value,
                      }))
                    }
                    placeholder="Auto: EXL-0001"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Primary Status
                  </span>
                  <select
                    value={form.is_primary_listing ? "yes" : "no"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_primary_listing: event.target.value === "yes",
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
                    Listing Status <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.listing_status}
                    onChange={(event) =>
                      handleListingStatusChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    {listingStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Stock Exchange <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={form.stock_exchange}
                    onChange={(event) =>
                      handleStockExchangeChange(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    {stockExchangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Trading Code
                  </span>
                  <input
                    value={form.trading_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        trading_code: event.target.value,
                      }))
                    }
                    disabled={form.stock_exchange === "none"}
                    placeholder="Example: SQURPHARMA"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Scrip Code
                  </span>
                  <input
                    value={form.scrip_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        scrip_code: event.target.value,
                      }))
                    }
                    disabled={form.stock_exchange === "none"}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    ISIN Code
                  </span>
                  <input
                    value={form.isin_code}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isin_code: event.target.value,
                      }))
                    }
                    disabled={form.stock_exchange === "none"}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Market Category
                  </span>
                  <select
                    value={form.market_category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        market_category: event.target.value,
                      }))
                    }
                    disabled={form.stock_exchange === "none"}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  >
                    <option value="">Select category</option>
                    {marketCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Listed Sector
                  </span>
                  <input
                    value={form.listed_sector}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        listed_sector: event.target.value,
                      }))
                    }
                    disabled={form.stock_exchange === "none"}
                    placeholder="Example: Pharmaceuticals"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Listing Date
                  </span>
                  <input
                    type="date"
                    value={form.listing_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        listing_date: event.target.value,
                      }))
                    }
                    disabled={form.stock_exchange === "none"}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
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
                    rows={4}
                    placeholder="Example: Unlisted private company"
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

