"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit3,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { useModuleActions } from "@/hooks/useModuleActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudFormSection from "@/components/crud/CrudFormSection";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import {
  type AuditEntityTaxAppealStatus,
  type AuditEntityTaxAssessment,
  type AuditEntityTaxAssessmentPayload,
  type AuditEntityTaxAssessmentStatus,
  type AuditEntityTaxType,
  createAuditEntityTaxAssessment,
  deactivateAuditEntityTaxAssessment,
  listAuditEntityTaxAssessments,
  permanentDeleteAuditEntityTaxAssessment,
  restoreAuditEntityTaxAssessment,
  updateAuditEntityTaxAssessment,
} from "@/services/auditEntityTaxAssessment";

const MODULE_KEY = "audit_entity_tax_assessment";

type StatusFilter = "all" | "active" | "inactive";

type AuditEntityOption = {
  id: number;
  entity_code: string | null;
  entity_name: string;
  is_active: boolean;
};

type AuditEntityListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityOption[];
};

type TaxAssessmentFormState = {
  audit_entity_id: string;
  tax_year: string;
  assessment_year: string;
  tax_type: AuditEntityTaxType;
  tax_identification_no: string;
  tax_zone: string;
  tax_circle: string;
  tax_office: string;
  return_submission_date: string;
  assessment_date: string;
  demand_notice_date: string;
  payment_due_date: string;
  declared_income: string;
  assessed_income: string;
  taxable_income: string;
  tax_payable: string;
  tax_paid: string;
  outstanding_tax: string;
  penalty_amount: string;
  interest_amount: string;
  assessment_status: AuditEntityTaxAssessmentStatus;
  appeal_status: "" | AuditEntityTaxAppealStatus;
  document_reference: string;
  description: string;
  remarks: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const TAX_TYPE_OPTIONS: SelectOption[] = [
  { value: "income_tax", label: "Income Tax" },
  { value: "vat", label: "VAT" },
  { value: "withholding_tax", label: "Withholding Tax" },
  { value: "customs", label: "Customs" },
  { value: "sd", label: "Supplementary Duty" },
  { value: "other", label: "Other" },
];

const ASSESSMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "assessed", label: "Assessed" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "outstanding", label: "Outstanding" },
  { value: "appealed", label: "Appealed" },
  { value: "closed", label: "Closed" },
];

const APPEAL_STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "None" },
  { value: "not_applicable", label: "Not Applicable" },
  { value: "not_appealed", label: "Not Appealed" },
  { value: "appealed", label: "Appealed" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
  { value: "withdrawn", label: "Withdrawn" },
];

const DEFAULT_FORM: TaxAssessmentFormState = {
  audit_entity_id: "",
  tax_year: "2025-2026",
  assessment_year: "2026-2027",
  tax_type: "income_tax",
  tax_identification_no: "",
  tax_zone: "",
  tax_circle: "",
  tax_office: "",
  return_submission_date: "",
  assessment_date: "",
  demand_notice_date: "",
  payment_due_date: "",
  declared_income: "",
  assessed_income: "",
  taxable_income: "",
  tax_payable: "",
  tax_paid: "",
  outstanding_tax: "",
  penalty_amount: "",
  interest_amount: "",
  assessment_status: "draft",
  appeal_status: "",
  document_reference: "",
  description: "",
  remarks: "",
};

function toNullable(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function formatLabel(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatMoney(value: string | null) {
  if (!value) return "—";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return value;
  }

  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildPayload(form: TaxAssessmentFormState): AuditEntityTaxAssessmentPayload {
  return {
    audit_entity_id: Number(form.audit_entity_id),
    tax_year: form.tax_year.trim(),
    assessment_year: toNullable(form.assessment_year),
    tax_type: form.tax_type,
    tax_identification_no: toNullable(form.tax_identification_no),
    tax_zone: toNullable(form.tax_zone),
    tax_circle: toNullable(form.tax_circle),
    tax_office: toNullable(form.tax_office),
    return_submission_date: toNullable(form.return_submission_date),
    assessment_date: toNullable(form.assessment_date),
    demand_notice_date: toNullable(form.demand_notice_date),
    payment_due_date: toNullable(form.payment_due_date),
    declared_income: toNullable(form.declared_income),
    assessed_income: toNullable(form.assessed_income),
    taxable_income: toNullable(form.taxable_income),
    tax_payable: toNullable(form.tax_payable),
    tax_paid: toNullable(form.tax_paid),
    outstanding_tax: toNullable(form.outstanding_tax),
    penalty_amount: toNullable(form.penalty_amount),
    interest_amount: toNullable(form.interest_amount),
    assessment_status: form.assessment_status,
    appeal_status: form.appeal_status || null,
    document_reference: toNullable(form.document_reference),
    description: toNullable(form.description),
    remarks: toNullable(form.remarks),
  };
}

function toFormState(item: AuditEntityTaxAssessment): TaxAssessmentFormState {
  return {
    audit_entity_id: String(item.audit_entity_id),
    tax_year: item.tax_year,
    assessment_year: item.assessment_year ?? "",
    tax_type: item.tax_type,
    tax_identification_no: item.tax_identification_no ?? "",
    tax_zone: item.tax_zone ?? "",
    tax_circle: item.tax_circle ?? "",
    tax_office: item.tax_office ?? "",
    return_submission_date: item.return_submission_date ?? "",
    assessment_date: item.assessment_date ?? "",
    demand_notice_date: item.demand_notice_date ?? "",
    payment_due_date: item.payment_due_date ?? "",
    declared_income: item.declared_income ?? "",
    assessed_income: item.assessed_income ?? "",
    taxable_income: item.taxable_income ?? "",
    tax_payable: item.tax_payable ?? "",
    tax_paid: item.tax_paid ?? "",
    outstanding_tax: item.outstanding_tax ?? "",
    penalty_amount: item.penalty_amount ?? "",
    interest_amount: item.interest_amount ?? "",
    assessment_status: item.assessment_status,
    appeal_status: item.appeal_status ?? "",
    document_reference: item.document_reference ?? "",
    description: item.description ?? "",
    remarks: item.remarks ?? "",
  };
}

async function parseApiError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };

    return data.detail ?? data.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function loadAuditEntityOptions() {
  const response = await fetch(
    "/api/backend/audit-entities?page=1&page_size=100&is_active=true&sort_by=id&sort_order=asc",
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = (await response.json()) as AuditEntityListResponse;

  return data.items;
}

export default function AuditEntityTaxAssessmentsPage() {
  const actions = useModuleActions(MODULE_KEY);

  const [items, setItems] = useState<AuditEntityTaxAssessment[]>([]);
  const [auditEntities, setAuditEntities] = useState<AuditEntityOption[]>([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [taxYearFilter, setTaxYearFilter] = useState("");
  const [taxTypeFilter, setTaxTypeFilter] = useState("all");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState("all");
  const [appealStatusFilter, setAppealStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isEntityLoading, setIsEntityLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AuditEntityTaxAssessment | null>(
    null,
  );
  const [form, setForm] = useState<TaxAssessmentFormState>(DEFAULT_FORM);

  const resolvedPageSize = pageSize === "all" ? 100 : Number(pageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / resolvedPageSize));
  }, [resolvedPageSize, total]);

  const entityNameMap = useMemo(() => {
    return new Map(
      auditEntities.map((entity) => [
        entity.id,
        `${entity.entity_code ? `${entity.entity_code} - ` : ""}${entity.entity_name}`,
      ]),
    );
  }, [auditEntities]);

  const loadEntities = useCallback(async () => {
    try {
      setIsEntityLoading(true);
      const entityItems = await loadAuditEntityOptions();
      setAuditEntities(entityItems);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load audit entities.";
      setErrorMessage(message);
    } finally {
      setIsEntityLoading(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await listAuditEntityTaxAssessments({
        page,
        page_size: resolvedPageSize,
        search: debouncedSearch,
        is_active:
          statusFilter === "all" ? undefined : statusFilter === "active",
        audit_entity_id:
          entityFilter === "all" ? undefined : Number(entityFilter),
        tax_year: taxYearFilter.trim() || undefined,
        tax_type: taxTypeFilter === "all" ? undefined : taxTypeFilter,
        assessment_status:
          assessmentStatusFilter === "all" ? undefined : assessmentStatusFilter,
        appeal_status:
          appealStatusFilter === "all" ? undefined : appealStatusFilter,
        sort_by: "id",
        sort_order: "asc",
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load tax assessments.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    assessmentStatusFilter,
    appealStatusFilter,
    debouncedSearch,
    entityFilter,
    page,
    resolvedPageSize,
    statusFilter,
    taxTypeFilter,
    taxYearFilter,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadEntities();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadEntities]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadItems]);

  const openCreateDrawer = () => {
    setEditingItem(null);
    setForm(DEFAULT_FORM);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (item: AuditEntityTaxAssessment) => {
    setEditingItem(item);
    setForm(toFormState(item));
    setErrorMessage("");
    setSuccessMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
    setForm(DEFAULT_FORM);
  };

  const handleSave = async () => {
    if (!form.audit_entity_id) {
      setErrorMessage("Audit entity is required.");
      return;
    }

    if (!form.tax_year.trim()) {
      setErrorMessage("Tax year is required.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = buildPayload(form);

      const response = editingItem
        ? await updateAuditEntityTaxAssessment(editingItem.id, payload)
        : await createAuditEntityTaxAssessment(payload);

      setSuccessMessage(response.message);
      closeDrawer();
      await loadItems();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save tax assessment.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (item: AuditEntityTaxAssessment) => {
    if (!window.confirm("Are you sure you want to deactivate this record?")) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      const response = await deactivateAuditEntityTaxAssessment(item.id);
      setSuccessMessage(response.message);
      await loadItems();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to deactivate tax assessment.";
      setErrorMessage(message);
    }
  };

  const handleRestore = async (item: AuditEntityTaxAssessment) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const response = await restoreAuditEntityTaxAssessment(item.id);
      setSuccessMessage(response.message);
      await loadItems();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to restore tax assessment.";
      setErrorMessage(message);
    }
  };

  const handlePermanentDelete = async (item: AuditEntityTaxAssessment) => {
    if (
      !window.confirm(
        "This will permanently delete the tax assessment. Continue?",
      )
    ) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      const response = await permanentDeleteAuditEntityTaxAssessment(item.id);
      setSuccessMessage(response.message);
      await loadItems();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to permanently delete tax assessment.";
      setErrorMessage(message);
    }
  };

  const resetFilters = () => {
    setPage(1);
    setSearch("");
    setStatusFilter("all");
    setEntityFilter("all");
    setTaxYearFilter("");
    setTaxTypeFilter("all");
    setAssessmentStatusFilter("all");
    setAppealStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-7 text-white shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <FileSpreadsheet className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                Audit Entity Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Tax Assessments</h1>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
                Maintain year-wise tax assessment, return submission, demand,
                payment, appeal, penalty, interest and outstanding tax
                information for audit entities.
              </p>
            </div>
          </div>

          {actions.canCreate ? (
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              Add Tax Assessment
            </button>
          ) : null}
        </div>
      </section>

      {errorMessage && !isDrawerOpen ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <CrudToolbar
          pageSize={pageSize}
          onPageSizeChange={(value) => {
            setPage(1);
            setPageSize(value as CrudPageSizeOption);
          }}
          onRefresh={() => void loadItems()}
          onReset={resetFilters}
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              value: search,
              placeholder: "Search TIN, zone, circle, office...",
              onChange: (value) => {
                setPage(1);
                setSearch(value);
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
                setPage(1);
                setStatusFilter(value as StatusFilter);
              },
            },
            {
              key: "entity",
              label: "Entity",
              type: "select",
              value: entityFilter,
              options: [
                {
                  value: "all",
                  label: isEntityLoading ? "Loading..." : "All",
                },
                ...auditEntities.map((entity) => ({
                  value: String(entity.id),
                  label: `${entity.entity_code ? `${entity.entity_code} - ` : ""}${entity.entity_name}`,
                })),
              ],
              onChange: (value) => {
                setPage(1);
                setEntityFilter(value);
              },
            },
            {
              key: "tax_year",
              label: "Tax Year",
              type: "text",
              value: taxYearFilter,
              placeholder: "2025-2026",
              onChange: (value) => {
                setPage(1);
                setTaxYearFilter(value);
              },
            },
            {
              key: "tax_type",
              label: "Tax Type",
              type: "select",
              value: taxTypeFilter,
              options: [
                { value: "all", label: "All" },
                ...TAX_TYPE_OPTIONS,
              ],
              onChange: (value) => {
                setPage(1);
                setTaxTypeFilter(value);
              },
            },
            {
              key: "assessment_status",
              label: "Assessment Status",
              type: "select",
              value: assessmentStatusFilter,
              options: [
                { value: "all", label: "All" },
                ...ASSESSMENT_STATUS_OPTIONS,
              ],
              onChange: (value) => {
                setPage(1);
                setAssessmentStatusFilter(value);
              },
            },
            {
              key: "appeal_status",
              label: "Appeal Status",
              type: "select",
              value: appealStatusFilter,
              options: [
                { value: "all", label: "All" },
                ...APPEAL_STATUS_OPTIONS.filter((option) => option.value),
              ],
              onChange: (value) => {
                setPage(1);
                setAppealStatusFilter(value);
              },
            },
          ]}
        />

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Entity
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Year / Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Tax Office
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Income
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Tax Position
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Dates
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading tax assessments...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center text-sm text-slate-500"
                  >
                    No tax assessment record found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {entityNameMap.get(item.audit_entity_id) ??
                          `Entity #${item.audit_entity_id}`}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        TIN: {item.tax_identification_no ?? "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-slate-800">
                        {item.tax_year}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Assessment: {item.assessment_year ?? "—"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatLabel(item.tax_type)}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top text-slate-600">
                      <div>{item.tax_office ?? "—"}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Zone: {item.tax_zone ?? "—"} | Circle:{" "}
                        {item.tax_circle ?? "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top text-slate-600">
                      <div>Declared: {formatMoney(item.declared_income)}</div>
                      <div>Assessed: {formatMoney(item.assessed_income)}</div>
                      <div>Taxable: {formatMoney(item.taxable_income)}</div>
                    </td>

                    <td className="px-5 py-4 align-top text-slate-600">
                      <div>Payable: {formatMoney(item.tax_payable)}</div>
                      <div>Paid: {formatMoney(item.tax_paid)}</div>
                      <div className="font-semibold text-slate-900">
                        Outstanding: {formatMoney(item.outstanding_tax)}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top text-slate-600">
                      <div>Return: {item.return_submission_date ?? "—"}</div>
                      <div>Assessment: {item.assessment_date ?? "—"}</div>
                      <div>Due: {item.payment_due_date ?? "—"}</div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatLabel(item.assessment_status)}
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Appeal: {formatLabel(item.appeal_status)}
                      </div>
                      <div className="mt-2">
                        <span
                          className={
                            item.is_active
                              ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                              : "inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                          }
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex justify-end gap-2">
                        {actions.canUpdate ? (
                          <button
                            type="button"
                            onClick={() => openEditDrawer(item)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        ) : null}

                        {item.is_active && actions.canInactive ? (
                          <button
                            type="button"
                            onClick={() => void handleDeactivate(item)}
                            className="rounded-xl border border-orange-200 p-2 text-orange-600 hover:bg-orange-50"
                            title="Inactive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}

                        {!item.is_active && actions.canRestore ? (
                          <button
                            type="button"
                            onClick={() => void handleRestore(item)}
                            className="rounded-xl border border-emerald-200 p-2 text-emerald-600 hover:bg-emerald-50"
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : null}

                        {actions.canPermanentDelete ? (
                          <button
                            type="button"
                            onClick={() => void handlePermanentDelete(item)}
                            className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Permanent Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <CrudPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={resolvedPageSize}
          onPageChange={setPage}
        />
      </section>

      <CrudDrawer
        isOpen={isDrawerOpen}
        title={editingItem ? "Edit Tax Assessment" : "Add Tax Assessment"}
        description="Capture tax return, assessment, appeal, and payment information."
        onClose={closeDrawer}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        {/* Drawer form validation/error message */}
        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

              <CrudFormSection title="Basic Information">

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Audit Entity
                    </span>
                    <select
                      value={form.audit_entity_id}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          audit_entity_id: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    >
                      <option value="">
                        {isEntityLoading ? "Loading..." : "Select entity"}
                      </option>
                      {auditEntities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                          {entity.entity_code ? `${entity.entity_code} - ` : ""}
                          {entity.entity_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <CrudTextField
                    label="Tax Year"
                    value={form.tax_year}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_year: value,
                      }))
                    }
                    placeholder="2025-2026"
                  />

                  <CrudTextField
                    label="Assessment Year"
                    value={form.assessment_year}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        assessment_year: value,
                      }))
                    }
                    placeholder="2026-2027"
                  />

                  <CrudSelectField
                    label="Tax Type"
                    value={form.tax_type}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_type: value as AuditEntityTaxType,
                      }))
                    }
                    options={TAX_TYPE_OPTIONS}
                  />

                  <CrudSelectField
                    label="Assessment Status"
                    value={form.assessment_status}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        assessment_status: value as AuditEntityTaxAssessmentStatus,
                      }))
                    }
                    options={ASSESSMENT_STATUS_OPTIONS}
                  />

                  <CrudSelectField
                    label="Appeal Status"
                    value={form.appeal_status}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        appeal_status: value as "" | AuditEntityTaxAppealStatus,
                      }))
                    }
                    options={APPEAL_STATUS_OPTIONS}
                  />

                  <CrudTextField
                    label="Tax Identification No"
                    value={form.tax_identification_no}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_identification_no: value,
                      }))
                    }
                    placeholder="TIN / e-TIN"
                  />
                </div>
              </CrudFormSection>

              <CrudFormSection title="Tax Office">

                <div className="grid gap-4 md:grid-cols-2">
                  <CrudTextField
                    label="Tax Zone"
                    value={form.tax_zone}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_zone: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Tax Circle"
                    value={form.tax_circle}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_circle: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Tax Office"
                    value={form.tax_office}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_office: value,
                      }))
                    }
                  />
                </div>
              </CrudFormSection>

              <CrudFormSection title="Important Dates">

                <div className="grid gap-4 md:grid-cols-2">
                  <CrudTextField
                    label="Return Submission Date"
                    type="date"
                    value={form.return_submission_date}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        return_submission_date: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Assessment Date"
                    type="date"
                    value={form.assessment_date}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        assessment_date: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Demand Notice Date"
                    type="date"
                    value={form.demand_notice_date}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        demand_notice_date: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Payment Due Date"
                    type="date"
                    value={form.payment_due_date}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        payment_due_date: value,
                      }))
                    }
                  />
                </div>
              </CrudFormSection>

              <CrudFormSection title="Income and Tax Amounts">

                <div className="grid gap-4 md:grid-cols-3">
                  <CrudTextField
                    label="Declared Income"
                    type="number"
                    value={form.declared_income}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        declared_income: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Assessed Income"
                    type="number"
                    value={form.assessed_income}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        assessed_income: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Taxable Income"
                    type="number"
                    value={form.taxable_income}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        taxable_income: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Tax Payable"
                    type="number"
                    value={form.tax_payable}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_payable: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Tax Paid"
                    type="number"
                    value={form.tax_paid}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        tax_paid: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Outstanding Tax"
                    type="number"
                    value={form.outstanding_tax}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        outstanding_tax: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Penalty Amount"
                    type="number"
                    value={form.penalty_amount}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        penalty_amount: value,
                      }))
                    }
                  />

                  <CrudTextField
                    label="Interest Amount"
                    type="number"
                    value={form.interest_amount}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        interest_amount: value,
                      }))
                    }
                  />
                </div>
              </CrudFormSection>

              <CrudFormSection title="Reference and Notes">

                <div className="grid gap-4">
                  <CrudTextField
                    label="Document Reference"
                    value={form.document_reference}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        document_reference: value,
                      }))
                    }
                    placeholder="Assessment order / challan / file reference"
                  />

                  <CrudTextAreaField
                    label="Description"
                    value={form.description}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        description: value,
                      }))
                    }
                  />

                  <CrudTextAreaField
                    label="Remarks"
                    value={form.remarks}
                    onChange={(value) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        remarks: value,
                      }))
                    }
                  />
                </div>
              </CrudFormSection>
      </CrudDrawer>
    </div>
  );
}

