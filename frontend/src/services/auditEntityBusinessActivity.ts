export type AuditEntityBusinessActivity = {
  id: number;
  audit_entity_id: number;
  activity_code: string;
  activity_name: string;
  business_nature_id: number;
  business_sector_id: number;
  business_industry_id: number;
  is_primary: boolean;
  risk_rating: string | null;
  revenue_percentage: number | null;
  description: string | null;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityBusinessActivityListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityBusinessActivity[];
};

export type AuditEntityBusinessActivityPayload = {
  audit_entity_id: number;
  activity_code?: string | null;
  activity_name: string;
  business_nature_id: number;
  business_sector_id: number;
  business_industry_id: number;
  is_primary: boolean;
  risk_rating?: string | null;
  revenue_percentage?: number | null;
  description?: string | null;
  remarks?: string | null;
};

export type AuditEntityBusinessActivityUpdatePayload =
  Partial<AuditEntityBusinessActivityPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  businessNatureId?: number;
  businessSectorId?: number;
  businessIndustryId?: number;
  isPrimary?: boolean;
  riskRating?: string;
};

function buildQuery(params: ListParams) {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("page_size", String(params.pageSize));
  query.set("sort_by", "id");
  query.set("sort_order", "asc");

  if (params.search) query.set("search", params.search);
  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }
  if (params.auditEntityId) {
    query.set("audit_entity_id", String(params.auditEntityId));
  }
  if (params.businessNatureId) {
    query.set("business_nature_id", String(params.businessNatureId));
  }
  if (params.businessSectorId) {
    query.set("business_sector_id", String(params.businessSectorId));
  }
  if (params.businessIndustryId) {
    query.set("business_industry_id", String(params.businessIndustryId));
  }
  if (typeof params.isPrimary === "boolean") {
    query.set("is_primary", String(params.isPrimary));
  }
  if (params.riskRating) query.set("risk_rating", params.riskRating);

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
      "Audit Entity Business Activity request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityBusinessActivities(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityBusinessActivityListResponse>(
    `/api/backend/audit-entity-business-activities?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityBusinessActivity(
  payload: AuditEntityBusinessActivityPayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityBusinessActivity;
  }>("/api/backend/audit-entity-business-activities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityBusinessActivity(
  id: number,
  payload: AuditEntityBusinessActivityUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityBusinessActivity;
  }>(`/api/backend/audit-entity-business-activities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityBusinessActivity(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityBusinessActivity;
  }>(`/api/backend/audit-entity-business-activities/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityBusinessActivity(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityBusinessActivity;
  }>(`/api/backend/audit-entity-business-activities/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityBusinessActivity(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-business-activities/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
