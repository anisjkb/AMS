export type AuditEntityContactType = {
  id: number;
  contact_type_code: string;
  contact_type_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityContactTypeListResponse = {
  total: number;
  items: AuditEntityContactType[];
};

export type AuditEntityContact = {
  id: number;
  audit_entity_id: number;
  contact_type_id: number;
  contact_name: string;
  designation: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  whatsapp: string | null;
  is_primary: boolean;
  is_authorized_representative: boolean;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityContactListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityContact[];
};

export type AuditEntityContactPayload = {
  audit_entity_id: number;
  contact_type_id: number;
  contact_name: string;
  designation?: string | null;
  department?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  whatsapp?: string | null;
  is_primary: boolean;
  is_authorized_representative: boolean;
  remarks?: string | null;
};

export type AuditEntityContactUpdatePayload =
  Partial<AuditEntityContactPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  contactTypeId?: number;
  isPrimary?: boolean;
  isAuthorizedRepresentative?: boolean;
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

  if (params.contactTypeId) {
    query.set("contact_type_id", String(params.contactTypeId));
  }

  if (typeof params.isPrimary === "boolean") {
    query.set("is_primary", String(params.isPrimary));
  }

  if (typeof params.isAuthorizedRepresentative === "boolean") {
    query.set(
      "is_authorized_representative",
      String(params.isAuthorizedRepresentative),
    );
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
      error?.detail || error?.message || "Audit entity contact request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityContactTypes(isActive = true) {
  return requestJson<AuditEntityContactTypeListResponse>(
    `/api/backend/audit-entity-contacts/types?is_active=${String(isActive)}`,
    {
      method: "GET",
    },
  );
}

export async function listAuditEntityContacts(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityContactListResponse>(
    `/api/backend/audit-entity-contacts?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityContact(
  payload: AuditEntityContactPayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityContact;
  }>("/api/backend/audit-entity-contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityContact(
  id: number,
  payload: AuditEntityContactUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityContact;
  }>(`/api/backend/audit-entity-contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityContact(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityContact;
  }>(`/api/backend/audit-entity-contacts/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityContact(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityContact;
  }>(`/api/backend/audit-entity-contacts/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityContact(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-contacts/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
