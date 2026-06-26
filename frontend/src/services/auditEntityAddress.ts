export type AuditEntityAddressType = {
  id: number;
  address_type_code: string;
  address_type_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityAddressTypeListResponse = {
  total: number;
  items: AuditEntityAddressType[];
};

export type AuditEntityAddress = {
  id: number;
  audit_entity_id: number;
  address_type_id: number;
  address_line1: string | null;
  address_line2: string | null;
  division_code: string | null;
  district_code: string | null;
  upazila_code: string | null;
  union_code: string | null;
  post_code: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  is_primary: boolean;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityAddressListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityAddress[];
};

export type AuditEntityAddressPayload = {
  audit_entity_id: number;
  address_type_id: number;
  address_line1?: string | null;
  address_line2?: string | null;
  division_code?: string | null;
  district_code?: string | null;
  upazila_code?: string | null;
  union_code?: string | null;
  post_code?: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
  is_primary: boolean;
  remarks?: string | null;
};

export type AuditEntityAddressUpdatePayload =
  Partial<AuditEntityAddressPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  addressTypeId?: number;
  isPrimary?: boolean;
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

  if (params.addressTypeId) {
    query.set("address_type_id", String(params.addressTypeId));
  }

  if (typeof params.isPrimary === "boolean") {
    query.set("is_primary", String(params.isPrimary));
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
      error?.detail || error?.message || "Audit entity address request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityAddressTypes(isActive = true) {
  return requestJson<AuditEntityAddressTypeListResponse>(
    `/api/backend/audit-entity-addresses/types?is_active=${String(isActive)}`,
    {
      method: "GET",
    },
  );
}

export async function listAuditEntityAddresses(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityAddressListResponse>(
    `/api/backend/audit-entity-addresses?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityAddress(
  payload: AuditEntityAddressPayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityAddress;
  }>("/api/backend/audit-entity-addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityAddress(
  id: number,
  payload: AuditEntityAddressUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityAddress;
  }>(`/api/backend/audit-entity-addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityAddress(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityAddress;
  }>(`/api/backend/audit-entity-addresses/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityAddress(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityAddress;
  }>(`/api/backend/audit-entity-addresses/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityAddress(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-addresses/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
