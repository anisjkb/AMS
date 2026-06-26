export type AuditEntity = {
  id: number;
  parent_entity_id: number | null;
  entity_code: string;
  entity_name: string;
  entity_type: string;
  entity_class: string;
  legal_status_id: number | null;
  legal_status: string | null;
  registration_no: string | null;
  tax_identification_no: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  risk_rating: string | null;
  is_internal: boolean;
  is_confidential: boolean;
  description: string | null;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntity[];
};

export type AuditEntityPayload = {
  parent_entity_id?: number | null;
  entity_code?: string | null;
  entity_name: string;
  entity_type: string;
  entity_class: string;
  legal_status_id?: number | null;
  legal_status?: string | null;
  registration_no?: string | null;
  tax_identification_no?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  risk_rating?: string | null;
  is_internal: boolean;
  is_confidential: boolean;
  description?: string | null;
  remarks?: string | null;
};

export type AuditEntityUpdatePayload = Partial<AuditEntityPayload> & {
  is_active?: boolean;
};

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  entityType?: string;
  entityClass?: string;
  parentEntityId?: number;
  riskRating?: string;
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

  if (params.entityType) query.set("entity_type", params.entityType);
  if (params.entityClass) query.set("entity_class", params.entityClass);

  if (params.parentEntityId) {
    query.set("parent_entity_id", String(params.parentEntityId));
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
      error?.detail || error?.message || "Audit entity request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntities(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityListResponse>(
    `/api/backend/audit-entities?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntity(payload: AuditEntityPayload) {
  return requestJson<{
    message: string;
    data: AuditEntity;
  }>("/api/backend/audit-entities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntity(
  id: number,
  payload: AuditEntityUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntity;
  }>(`/api/backend/audit-entities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntity(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntity;
  }>(`/api/backend/audit-entities/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntity(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntity;
  }>(`/api/backend/audit-entities/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntity(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entities/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
