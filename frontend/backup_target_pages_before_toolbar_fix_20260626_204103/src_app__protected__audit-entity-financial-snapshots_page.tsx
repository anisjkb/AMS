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
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileSpreadsheet,
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
  createAuditEntityFinancialSnapshot,
  deactivateAuditEntityFinancialSnapshot,
  listAuditEntityFinancialSnapshots,
  permanentDeleteAuditEntityFinancialSnapshot,
  restoreAuditEntityFinancialSnapshot,
  updateAuditEntityFinancialSnapshot,
  type AuditEntityFinancialSnapshot,
  type AuditEntityFinancialSnapshotPayload,
  type AuditEntityFinancialStatementType,
  type AuditEntityFinancialStatus,
} from "@/services/auditEntityFinancialSnapshot";

type StatusFilter = "all" | "active" | "inactive";
type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";
type DrawerMode = "create" | "edit";
type ConfirmAction = "delete" | "restore" | "permanent_delete";
type BooleanFilter = "" | "yes" | "no";

type FormState = {
  audit_entity_id: string;
  fiscal_year: string;
  period_start_date: string;
  period_end_date: string;
  statement_type: AuditEntityFinancialStatementType;
  reporting_framework: string;
  currency_code: string;
  financial_status: AuditEntityFinancialStatus;

  total_assets: string;
  total_liabilities: string;
  total_equity: string;
  current_assets: string;
  current_liabilities: string;

  revenue: string;
  cost_of_sales: string;
  gross_profit: string;
  operating_profit: string;
  profit_before_tax: string;
  profit_after_tax: string;

  cash_and_cash_equivalents: string;
  inventory: string;
  trade_receivables: string;
  trade_payables: string;
  loans_and_borrowings: string;
  ebitda: string;
  net_cash_flow: string;

  auditor_name: string;
  audit_report_date: string;
  source_document_reference: string;

  is_audited: boolean;
  is_consolidated: boolean;
  description: string;
  remarks: string;
};

const pageSizeOptions: PageSizeOption[] = [10, 20, 30, 40, 50, 100, "all"];

const statementTypeOptions: {
  value: AuditEntityFinancialStatementType;
  label: string;
}[] = [
  { value: "separate", label: "Separate" },
  { value: "consolidated", label: "Consolidated" },
  { value: "management", label: "Management" },
  { value: "provisional", label: "Provisional" },
];

const financialStatusOptions: {
  value: AuditEntityFinancialStatus;
  label: string;
}[] = [
  { value: "draft", label: "Draft" },
  { value: "management_provided", label: "Management Provided" },
  { value: "unaudited", label: "Unaudited" },
  { value: "audited", label: "Audited" },
  { value: "finalized", label: "Finalized" },
  { value: "restated", label: "Restated" },
];

const initialForm: FormState = {
  audit_entity_id: "",
  fiscal_year: "",
  period_start_date: "",
  period_end_date: "",
  statement_type: "separate",
  reporting_framework: "IFRS",
  currency_code: "BDT",
  financial_status: "draft",

  total_assets: "",
  total_liabilities: "",
  total_equity: "",
  current_assets: "",
  current_liabilities: "",

  revenue: "",
  cost_of_sales: "",
  gross_profit: "",
  operating_profit: "",
  profit_before_tax: "",
  profit_after_tax: "",

  cash_and_cash_equivalents: "",
  inventory: "",
  trade_receivables: "",
  trade_payables: "",
  loans_and_borrowings: "",
  ebitda: "",
  net_cash_flow: "",

  auditor_name: "",
  audit_report_date: "",
  source_document_reference: "",

  is_audited: false,
  is_consolidated: false,
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

function toOptionalNumber(value: string) {
  if (!value) return undefined;

  return Number(value);
}

function toBooleanFilter(value: BooleanFilter) {
  if (value === "yes") return true;
  if (value === "no") return false;

  return undefined;
}

function getStatementTypeLabel(value: string) {
  return (
    statementTypeOptions.find((option) => option.value === value)?.label ??
    value
  );
}

function getFinancialStatusLabel(value: string) {
  return (
    financialStatusOptions.find((option) => option.value === value)?.label ??
    value
  );
}

function getFinancialStatusClass(value: string) {
  if (value === "audited" || value === "finalized") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "unaudited" || value === "management_provided") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "restated") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function formatMoney(value: string | number | null, currencyCode = "BDT") {
  if (value === null || value === undefined || value === "") return "-";

  const amount = Number(value);

  if (Number.isNaN(amount)) return "-";

  return `${currencyCode} ${amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function toFormState(snapshot: AuditEntityFinancialSnapshot): FormState {
  return {
    audit_entity_id: String(snapshot.audit_entity_id),
    fiscal_year: snapshot.fiscal_year,
    period_start_date: snapshot.period_start_date ?? "",
    period_end_date: snapshot.period_end_date ?? "",
    statement_type: snapshot.statement_type,
    reporting_framework: snapshot.reporting_framework ?? "",
    currency_code: snapshot.currency_code,
    financial_status: snapshot.financial_status,

    total_assets:
      snapshot.total_assets === null || snapshot.total_assets === undefined
        ? ""
        : String(snapshot.total_assets),
    total_liabilities:
      snapshot.total_liabilities === null ||
      snapshot.total_liabilities === undefined
        ? ""
        : String(snapshot.total_liabilities),
    total_equity:
      snapshot.total_equity === null || snapshot.total_equity === undefined
        ? ""
        : String(snapshot.total_equity),
    current_assets:
      snapshot.current_assets === null || snapshot.current_assets === undefined
        ? ""
        : String(snapshot.current_assets),
    current_liabilities:
      snapshot.current_liabilities === null ||
      snapshot.current_liabilities === undefined
        ? ""
        : String(snapshot.current_liabilities),

    revenue:
      snapshot.revenue === null || snapshot.revenue === undefined
        ? ""
        : String(snapshot.revenue),
    cost_of_sales:
      snapshot.cost_of_sales === null || snapshot.cost_of_sales === undefined
        ? ""
        : String(snapshot.cost_of_sales),
    gross_profit:
      snapshot.gross_profit === null || snapshot.gross_profit === undefined
        ? ""
        : String(snapshot.gross_profit),
    operating_profit:
      snapshot.operating_profit === null ||
      snapshot.operating_profit === undefined
        ? ""
        : String(snapshot.operating_profit),
    profit_before_tax:
      snapshot.profit_before_tax === null ||
      snapshot.profit_before_tax === undefined
        ? ""
        : String(snapshot.profit_before_tax),
    profit_after_tax:
      snapshot.profit_after_tax === null ||
      snapshot.profit_after_tax === undefined
        ? ""
        : String(snapshot.profit_after_tax),

    cash_and_cash_equivalents:
      snapshot.cash_and_cash_equivalents === null ||
      snapshot.cash_and_cash_equivalents === undefined
        ? ""
        : String(snapshot.cash_and_cash_equivalents),
    inventory:
      snapshot.inventory === null || snapshot.inventory === undefined
        ? ""
        : String(snapshot.inventory),
    trade_receivables:
      snapshot.trade_receivables === null ||
      snapshot.trade_receivables === undefined
        ? ""
        : String(snapshot.trade_receivables),
    trade_payables:
      snapshot.trade_payables === null || snapshot.trade_payables === undefined
        ? ""
        : String(snapshot.trade_payables),
    loans_and_borrowings:
      snapshot.loans_and_borrowings === null ||
      snapshot.loans_and_borrowings === undefined
        ? ""
        : String(snapshot.loans_and_borrowings),
    ebitda:
      snapshot.ebitda === null || snapshot.ebitda === undefined
        ? ""
        : String(snapshot.ebitda),
    net_cash_flow:
      snapshot.net_cash_flow === null || snapshot.net_cash_flow === undefined
        ? ""
        : String(snapshot.net_cash_flow),

    auditor_name: snapshot.auditor_name ?? "",
    audit_report_date: snapshot.audit_report_date ?? "",
    source_document_reference: snapshot.source_document_reference ?? "",

    is_audited: snapshot.is_audited,
    is_consolidated: snapshot.is_consolidated,
    description: snapshot.description ?? "",
    remarks: snapshot.remarks ?? "",
  };
}

export default function AuditEntityFinancialSnapshotsPage() {
  const actions = useModuleActions("audit_entity_financial_snapshot");

  const [snapshots, setSnapshots] = useState<AuditEntityFinancialSnapshot[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntity[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityFilter, setEntityFilter] = useState("");
  const [fiscalYearFilter, setFiscalYearFilter] = useState("");
  const [statementTypeFilter, setStatementTypeFilter] = useState("");
  const [financialStatusFilter, setFinancialStatusFilter] = useState("");
  const [auditedFilter, setAuditedFilter] = useState<BooleanFilter>("");
  const [consolidatedFilter, setConsolidatedFilter] =
    useState<BooleanFilter>("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedSnapshot, setSelectedSnapshot] =
    useState<AuditEntityFinancialSnapshot | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<AuditEntityFinancialSnapshot | null>(null);

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
      const entityResponse = await listAuditEntities({
        page: 1,
        pageSize: 100,
        isActive: true,
        sortBy: "entity_name",
        sortOrder: "asc",
      });

      setAuditEntities(entityResponse.items);
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

  const loadSnapshots = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await listAuditEntityFinancialSnapshots({
        page,
        pageSize: numericPageSize,
        search: debouncedSearch.trim() || undefined,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        auditEntityId: toOptionalNumber(entityFilter),
        fiscalYear: fiscalYearFilter.trim() || undefined,
        statementType:
          statementTypeFilter === ""
            ? undefined
            : (statementTypeFilter as AuditEntityFinancialStatementType),
        financialStatus:
          financialStatusFilter === ""
            ? undefined
            : (financialStatusFilter as AuditEntityFinancialStatus),
        isAudited: toBooleanFilter(auditedFilter),
        isConsolidated: toBooleanFilter(consolidatedFilter),
        sortBy: "id",
        sortOrder: "desc",
      });

      setSnapshots(response.items);
      setTotalRecords(response.total);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load financial snapshots.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    auditedFilter,
    consolidatedFilter,
    debouncedSearch,
    entityFilter,
    financialStatusFilter,
    fiscalYearFilter,
    numericPageSize,
    page,
    statementTypeFilter,
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
      void loadSnapshots();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadSnapshots]);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedSnapshot(null);
    setForm(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (snapshot: AuditEntityFinancialSnapshot) => {
    setDrawerMode("edit");
    setSelectedSnapshot(snapshot);
    setForm(toFormState(snapshot));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (isSaving) return;

    setIsDrawerOpen(false);
    setSelectedSnapshot(null);
    setForm(initialForm);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value === "all" ? "all" : (Number(value) as PageSizeOption));
    setPage(1);
  };

  const buildPayload = (): AuditEntityFinancialSnapshotPayload => {
    return {
      audit_entity_id: Number(form.audit_entity_id),
      fiscal_year: form.fiscal_year.trim(),
      period_start_date: cleanDate(form.period_start_date),
      period_end_date: cleanDate(form.period_end_date),
      statement_type: form.statement_type,
      reporting_framework: cleanText(form.reporting_framework),
      currency_code: form.currency_code.trim().toUpperCase(),
      financial_status: form.financial_status,

      total_assets: cleanNumber(form.total_assets),
      total_liabilities: cleanNumber(form.total_liabilities),
      total_equity: cleanNumber(form.total_equity),
      current_assets: cleanNumber(form.current_assets),
      current_liabilities: cleanNumber(form.current_liabilities),

      revenue: cleanNumber(form.revenue),
      cost_of_sales: cleanNumber(form.cost_of_sales),
      gross_profit: cleanNumber(form.gross_profit),
      operating_profit: cleanNumber(form.operating_profit),
      profit_before_tax: cleanNumber(form.profit_before_tax),
      profit_after_tax: cleanNumber(form.profit_after_tax),

      cash_and_cash_equivalents: cleanNumber(form.cash_and_cash_equivalents),
      inventory: cleanNumber(form.inventory),
      trade_receivables: cleanNumber(form.trade_receivables),
      trade_payables: cleanNumber(form.trade_payables),
      loans_and_borrowings: cleanNumber(form.loans_and_borrowings),
      ebitda: cleanNumber(form.ebitda),
      net_cash_flow: cleanNumber(form.net_cash_flow),

      auditor_name: cleanText(form.auditor_name),
      audit_report_date: cleanDate(form.audit_report_date),
      source_document_reference: cleanText(form.source_document_reference),

      is_audited: form.is_audited,
      is_consolidated: form.is_consolidated,
      description: cleanText(form.description),
      remarks: cleanText(form.remarks),
    };
  };

  const validateNonNegative = (label: string, value: string) => {
    const numberValue = cleanNumber(value);

    if (numberValue !== null && (Number.isNaN(numberValue) || numberValue < 0)) {
      return `${label} cannot be negative.`;
    }

    return "";
  };

  const validateForm = () => {
    if (!form.audit_entity_id) {
      return "Audit entity is required.";
    }

    if (!form.fiscal_year.trim()) {
      return "Fiscal year is required.";
    }

    if (!form.currency_code.trim()) {
      return "Currency code is required.";
    }

    if (
      form.period_start_date &&
      form.period_end_date &&
      form.period_end_date < form.period_start_date
    ) {
      return "Period end date cannot be earlier than period start date.";
    }

    const nonNegativeChecks = [
      ["Total assets", form.total_assets],
      ["Total liabilities", form.total_liabilities],
      ["Current assets", form.current_assets],
      ["Current liabilities", form.current_liabilities],
      ["Cash and cash equivalents", form.cash_and_cash_equivalents],
      ["Inventory", form.inventory],
      ["Trade receivables", form.trade_receivables],
      ["Trade payables", form.trade_payables],
      ["Loans and borrowings", form.loans_and_borrowings],
    ];

    for (const [label, value] of nonNegativeChecks) {
      const message = validateNonNegative(label, value);

      if (message) return message;
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
        await createAuditEntityFinancialSnapshot(buildPayload());
        setSuccessMessage("Financial snapshot created successfully.");
      } else if (selectedSnapshot) {
        await updateAuditEntityFinancialSnapshot(
          selectedSnapshot.id,
          buildPayload(),
        );
        setSuccessMessage("Financial snapshot updated successfully.");
      }

      setIsDrawerOpen(false);
      setSelectedSnapshot(null);
      setForm(initialForm);

      await loadSnapshots();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save financial snapshot.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirm = (
    snapshot: AuditEntityFinancialSnapshot,
    action: ConfirmAction,
  ) => {
    setConfirmTarget(snapshot);
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
        await deactivateAuditEntityFinancialSnapshot(confirmTarget.id);
        setSuccessMessage("Financial snapshot deactivated successfully.");
      }

      if (confirmAction === "restore") {
        await restoreAuditEntityFinancialSnapshot(confirmTarget.id);
        setSuccessMessage("Financial snapshot restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentDeleteAuditEntityFinancialSnapshot(confirmTarget.id);
        setSuccessMessage("Financial snapshot permanently deleted successfully.");
      }

      closeConfirm();
      await loadSnapshots();
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
                <BarChart3 className="h-4 w-4" />
                Audit Entity Profile
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                Financial Snapshots
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Maintain year-wise financial profile, statement status, assets,
                liabilities, revenue, profit, working capital and audit report
                references.
              </p>
            </div>

            {actions.canCreate ? (
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add Financial Snapshot
              </button>
            ) : null}
          </div>
        </div>

        <div className="border-b border-slate-200 px-6 py-4">
          <div className="grid gap-3 lg:grid-cols-[110px_1fr_150px_180px_130px_160px_170px_130px_150px]">
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
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search year, framework, auditor, document ref..."
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
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter);
                  setPage(1);
                }}
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
                onChange={(event) => {
                  setEntityFilter(event.target.value);
                  setPage(1);
                }}
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
                Fiscal Year
              </span>
              <input
                value={fiscalYearFilter}
                onChange={(event) => {
                  setFiscalYearFilter(event.target.value);
                  setPage(1);
                }}
                placeholder="2025-2026"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Statement Type
              </span>
              <select
                value={statementTypeFilter}
                onChange={(event) => {
                  setStatementTypeFilter(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                {statementTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Financial Status
              </span>
              <select
                value={financialStatusFilter}
                onChange={(event) => {
                  setFinancialStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                {financialStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Audited
              </span>
              <select
                value={auditedFilter}
                onChange={(event) => {
                  setAuditedFilter(event.target.value as BooleanFilter);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">
                Consolidated
              </span>
              <select
                value={consolidatedFilter}
                onChange={(event) => {
                  setConsolidatedFilter(event.target.value as BooleanFilter);
                  setPage(1);
                }}
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
                  Period / Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Balance Sheet
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profit / Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Working Capital
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Audit Info
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
                      Loading financial snapshots...
                    </div>
                  </td>
                </tr>
              ) : snapshots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No financial snapshots found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add year-wise financial profile for audit entities.
                    </p>
                  </td>
                </tr>
              ) : (
                snapshots.map((snapshot) => {
                  const entity = entityById.get(snapshot.audit_entity_id);
                  const canEdit = actions.canUpdate;
                  const canDeactivate =
                    snapshot.is_active &&
                    (actions.canInactive || actions.canDelete);
                  const canRestore = !snapshot.is_active && actions.canRestore;
                  const canPermanentDelete =
                    !snapshot.is_active && actions.canPermanentDelete;

                  return (
                    <tr key={snapshot.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {entity?.entity_name ??
                            `Entity #${snapshot.audit_entity_id}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {entity?.entity_code ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-900">
                          FY {snapshot.fiscal_year}
                        </div>
                        <div className="mt-1 text-sm text-slate-700">
                          {getStatementTypeLabel(snapshot.statement_type)}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                          {snapshot.period_start_date ?? "-"} to{" "}
                          {snapshot.period_end_date ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Framework: {snapshot.reporting_framework ?? "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-slate-800">
                          Assets:{" "}
                          {formatMoney(
                            snapshot.total_assets,
                            snapshot.currency_code,
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Liabilities:{" "}
                          {formatMoney(
                            snapshot.total_liabilities,
                            snapshot.currency_code,
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Equity:{" "}
                          {formatMoney(
                            snapshot.total_equity,
                            snapshot.currency_code,
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-slate-800">
                          Revenue:{" "}
                          {formatMoney(snapshot.revenue, snapshot.currency_code)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Gross Profit:{" "}
                          {formatMoney(
                            snapshot.gross_profit,
                            snapshot.currency_code,
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          PAT:{" "}
                          {formatMoney(
                            snapshot.profit_after_tax,
                            snapshot.currency_code,
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-slate-800">
                          Cash:{" "}
                          {formatMoney(
                            snapshot.cash_and_cash_equivalents,
                            snapshot.currency_code,
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Inventory:{" "}
                          {formatMoney(
                            snapshot.inventory,
                            snapshot.currency_code,
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Receivables:{" "}
                          {formatMoney(
                            snapshot.trade_receivables,
                            snapshot.currency_code,
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-slate-800">
                          {snapshot.auditor_name ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Report Date: {snapshot.audit_report_date ?? "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Ref: {snapshot.source_document_reference ?? "-"}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {snapshot.is_audited ? (
                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              Audited
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              Unaudited
                            </span>
                          )}

                          {snapshot.is_consolidated ? (
                            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              Consolidated
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getFinancialStatusClass(
                              snapshot.financial_status,
                            )}`}
                          >
                            {getFinancialStatusLabel(snapshot.financial_status)}
                          </span>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                snapshot.is_active
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {snapshot.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => openEditDrawer(snapshot)}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canDeactivate ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(snapshot, "delete")}
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              title="Inactive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}

                          {canRestore ? (
                            <button
                              type="button"
                              onClick={() => openConfirm(snapshot, "restore")}
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
                                openConfirm(snapshot, "permanent_delete")
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
          <div className="h-full w-full max-w-6xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {drawerMode === "create"
                    ? "Create Financial Snapshot"
                    : "Edit Financial Snapshot"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep year-wise financial statement and audit report summary.
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

            <form onSubmit={handleSubmit} className="space-y-8 px-6 py-6">
              {isReadOnly ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  You do not have create/update permission for this module.
                </div>
              ) : null}

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-slate-500" />
                  <h3 className="font-bold text-slate-900">
                    Statement Information
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-1 lg:col-span-3">
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
                        {isMasterLoading
                          ? "Loading entities..."
                          : "Select entity"}
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
                      Fiscal Year <span className="text-rose-500">*</span>
                    </span>
                    <input
                      value={form.fiscal_year}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fiscal_year: event.target.value,
                        }))
                      }
                      placeholder="Example: 2025-2026"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Period Start
                    </span>
                    <input
                      value={form.period_start_date}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          period_start_date: event.target.value,
                        }))
                      }
                      type="date"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Period End
                    </span>
                    <input
                      value={form.period_end_date}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          period_end_date: event.target.value,
                        }))
                      }
                      type="date"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Statement Type
                    </span>
                    <select
                      value={form.statement_type}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          statement_type: event.target
                            .value as AuditEntityFinancialStatementType,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    >
                      {statementTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Financial Status
                    </span>
                    <select
                      value={form.financial_status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          financial_status: event.target
                            .value as AuditEntityFinancialStatus,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    >
                      {financialStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Currency
                    </span>
                    <input
                      value={form.currency_code}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          currency_code: event.target.value,
                        }))
                      }
                      placeholder="BDT"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase outline-none transition focus:border-slate-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Reporting Framework
                    </span>
                    <input
                      value={form.reporting_framework}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          reporting_framework: event.target.value,
                        }))
                      }
                      placeholder="IFRS / IFRS for SMEs / BAS"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-slate-500" />
                  <h3 className="font-bold text-slate-900">
                    Balance Sheet Summary
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["Total Assets", "total_assets"],
                    ["Total Liabilities", "total_liabilities"],
                    ["Total Equity", "total_equity"],
                    ["Current Assets", "current_assets"],
                    ["Current Liabilities", "current_liabilities"],
                  ].map(([label, field]) => (
                    <label key={field} className="space-y-1">
                      <span className="text-sm font-semibold text-slate-700">
                        {label}
                      </span>
                      <input
                        value={form[field as keyof FormState] as string}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-slate-500" />
                  <h3 className="font-bold text-slate-900">
                    Profit or Loss Summary
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Revenue", "revenue"],
                    ["Cost of Sales", "cost_of_sales"],
                    ["Gross Profit", "gross_profit"],
                    ["Operating Profit", "operating_profit"],
                    ["Profit Before Tax", "profit_before_tax"],
                    ["Profit After Tax", "profit_after_tax"],
                    ["EBITDA", "ebitda"],
                    ["Net Cash Flow", "net_cash_flow"],
                  ].map(([label, field]) => (
                    <label key={field} className="space-y-1">
                      <span className="text-sm font-semibold text-slate-700">
                        {label}
                      </span>
                      <input
                        value={form[field as keyof FormState] as string}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-slate-500" />
                  <h3 className="font-bold text-slate-900">
                    Working Capital Summary
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["Cash and Cash Equivalents", "cash_and_cash_equivalents"],
                    ["Inventory", "inventory"],
                    ["Trade Receivables", "trade_receivables"],
                    ["Trade Payables", "trade_payables"],
                    ["Loans and Borrowings", "loans_and_borrowings"],
                  ].map(([label, field]) => (
                    <label key={field} className="space-y-1">
                      <span className="text-sm font-semibold text-slate-700">
                        {label}
                      </span>
                      <input
                        value={form[field as keyof FormState] as string}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-500" />
                  <h3 className="font-bold text-slate-900">
                    Audit Report Information
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Auditor Name
                    </span>
                    <input
                      value={form.auditor_name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          auditor_name: event.target.value,
                        }))
                      }
                      placeholder="Audit firm name"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Audit Report Date
                    </span>
                    <input
                      value={form.audit_report_date}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          audit_report_date: event.target.value,
                        }))
                      }
                      type="date"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Source Document Reference
                    </span>
                    <input
                      value={form.source_document_reference}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          source_document_reference: event.target.value,
                        }))
                      }
                      placeholder="Document ID / file location"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-slate-700">
                      Audited
                    </span>
                    <select
                      value={form.is_audited ? "yes" : "no"}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          is_audited: event.target.value === "yes",
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
                      Consolidated
                    </span>
                    <select
                      value={form.is_consolidated ? "yes" : "no"}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          is_consolidated: event.target.value === "yes",
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700">
                    Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Financial snapshot description"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  />
                </label>

                <label className="space-y-1">
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
                  this financial snapshot?
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

