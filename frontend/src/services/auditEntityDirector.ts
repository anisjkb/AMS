export type AuditEntityDirectorType = {
  id: number;
  director_type_code: string;
  director_type_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityDirectorTypeListResponse = {
  total: number;
  items: AuditEntityDirectorType[];
};

export type AuditEntityDirector = {
  id: number;
  audit_entity_id: number;
  director_type_id: number;
  person_name: string;
  designation: string | null;
  father_name: string | null;
  mother_name: string | null;
  spouse_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  nid_no: string | null;
  passport_no: string | null;
  tax_identification_no: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  ownership_percentage: string | number | null;
  appointment_date: string | null;
  resignation_date: string | null;
  address: string | null;
  is_primary: boolean;
  is_signatory: boolean;
  is_beneficial_owner: boolean;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityDirectorListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityDirector[];
};

export type AuditEntityDirectorPayload = {
  audit_entity_id: number;
  director_type_id: number;
  person_name: string;
  designation?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  spouse_name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  nid_no?: string | null;
  passport_no?: string | null;
  tax_identification_no?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  ownership_percentage?: number | null;
  appointment_date?: string | null;
  resignation_date?: string | null;
  address?: string | null;
  is_primary: boolean;
  is_signatory: boolean;
  is_beneficial_owner: boolean;
  remarks?: string | null;
};

export type AuditEntityDirectorUpdatePayload =
  Partial<AuditEntityDirectorPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  directorTypeId?: number;
  isPrimary?: boolean;
  isSignatory?: boolean;
  isBeneficialOwner?: boolean;
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

  if (params.directorTypeId) {
    query.set("director_type_id", String(params.directorTypeId));
  }

  if (typeof params.isPrimary === "boolean") {
    query.set("is_primary", String(params.isPrimary));
  }

  if (typeof params.isSignatory === "boolean") {
    query.set("is_signatory", String(params.isSignatory));
  }

  if (typeof params.isBeneficialOwner === "boolean") {
    query.set("is_beneficial_owner", String(params.isBeneficialOwner));
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
      "Audit entity director/owner request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityDirectorTypes(isActive = true) {
  return requestJson<AuditEntityDirectorTypeListResponse>(
    `/api/backend/audit-entity-directors/types?is_active=${String(isActive)}`,
    {
      method: "GET",
    },
  );
}

export async function listAuditEntityDirectors(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityDirectorListResponse>(
    `/api/backend/audit-entity-directors?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityDirector(
  payload: AuditEntityDirectorPayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityDirector;
  }>("/api/backend/audit-entity-directors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityDirector(
  id: number,
  payload: AuditEntityDirectorUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityDirector;
  }>(`/api/backend/audit-entity-directors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityDirector(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityDirector;
  }>(`/api/backend/audit-entity-directors/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityDirector(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityDirector;
  }>(`/api/backend/audit-entity-directors/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityDirector(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-directors/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
