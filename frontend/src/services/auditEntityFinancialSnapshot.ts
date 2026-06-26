export type AuditEntityFinancialStatementType =
  | "separate"
  | "consolidated"
  | "management"
  | "provisional";

export type AuditEntityFinancialStatus =
  | "draft"
  | "management_provided"
  | "unaudited"
  | "audited"
  | "finalized"
  | "restated";

export type AuditEntityFinancialSnapshot = {
  id: number;
  audit_entity_id: number;
  fiscal_year: string;
  period_start_date: string | null;
  period_end_date: string | null;
  statement_type: AuditEntityFinancialStatementType;
  reporting_framework: string | null;
  currency_code: string;
  financial_status: AuditEntityFinancialStatus;

  total_assets: string | number | null;
  total_liabilities: string | number | null;
  total_equity: string | number | null;
  current_assets: string | number | null;
  current_liabilities: string | number | null;

  revenue: string | number | null;
  cost_of_sales: string | number | null;
  gross_profit: string | number | null;
  operating_profit: string | number | null;
  profit_before_tax: string | number | null;
  profit_after_tax: string | number | null;

  cash_and_cash_equivalents: string | number | null;
  inventory: string | number | null;
  trade_receivables: string | number | null;
  trade_payables: string | number | null;
  loans_and_borrowings: string | number | null;
  ebitda: string | number | null;
  net_cash_flow: string | number | null;

  auditor_name: string | null;
  audit_report_date: string | null;
  source_document_reference: string | null;

  is_audited: boolean;
  is_consolidated: boolean;
  description: string | null;
  remarks: string | null;

  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityFinancialSnapshotListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityFinancialSnapshot[];
};

export type AuditEntityFinancialSnapshotPayload = {
  audit_entity_id: number;
  fiscal_year: string;
  period_start_date?: string | null;
  period_end_date?: string | null;
  statement_type: AuditEntityFinancialStatementType;
  reporting_framework?: string | null;
  currency_code: string;
  financial_status: AuditEntityFinancialStatus;

  total_assets?: number | null;
  total_liabilities?: number | null;
  total_equity?: number | null;
  current_assets?: number | null;
  current_liabilities?: number | null;

  revenue?: number | null;
  cost_of_sales?: number | null;
  gross_profit?: number | null;
  operating_profit?: number | null;
  profit_before_tax?: number | null;
  profit_after_tax?: number | null;

  cash_and_cash_equivalents?: number | null;
  inventory?: number | null;
  trade_receivables?: number | null;
  trade_payables?: number | null;
  loans_and_borrowings?: number | null;
  ebitda?: number | null;
  net_cash_flow?: number | null;

  auditor_name?: string | null;
  audit_report_date?: string | null;
  source_document_reference?: string | null;

  is_audited: boolean;
  is_consolidated: boolean;
  description?: string | null;
  remarks?: string | null;
};

export type AuditEntityFinancialSnapshotUpdatePayload =
  Partial<AuditEntityFinancialSnapshotPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  fiscalYear?: string;
  statementType?: AuditEntityFinancialStatementType;
  financialStatus?: AuditEntityFinancialStatus;
  isAudited?: boolean;
  isConsolidated?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", params.sortBy ?? "id");
  query.set("sort_order", params.sortOrder ?? "asc");

  if (params.search) query.set("search", params.search);

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.auditEntityId) {
    query.set("audit_entity_id", String(params.auditEntityId));
  }

  if (params.fiscalYear) {
    query.set("fiscal_year", params.fiscalYear);
  }

  if (params.statementType) {
    query.set("statement_type", params.statementType);
  }

  if (params.financialStatus) {
    query.set("financial_status", params.financialStatus);
  }

  if (typeof params.isAudited === "boolean") {
    query.set("is_audited", String(params.isAudited));
  }

  if (typeof params.isConsolidated === "boolean") {
    query.set("is_consolidated", String(params.isConsolidated));
  }

  return query.toString();
}

async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error?.detail ||
      error?.message ||
      "Audit entity financial snapshot request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityFinancialSnapshots(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityFinancialSnapshotListResponse>(
    `/api/backend/audit-entity-financial-snapshots?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityFinancialSnapshot(
  payload: AuditEntityFinancialSnapshotPayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityFinancialSnapshot;
  }>("/api/backend/audit-entity-financial-snapshots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityFinancialSnapshot(
  id: number,
  payload: AuditEntityFinancialSnapshotUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityFinancialSnapshot;
  }>(`/api/backend/audit-entity-financial-snapshots/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityFinancialSnapshot(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityFinancialSnapshot;
  }>(`/api/backend/audit-entity-financial-snapshots/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityFinancialSnapshot(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityFinancialSnapshot;
  }>(`/api/backend/audit-entity-financial-snapshots/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityFinancialSnapshot(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-financial-snapshots/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
