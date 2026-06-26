export type AuditEntityLicenseType = {
  id: number;
  license_type_code: string;
  license_type_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityLicenseTypeListResponse = {
  total: number;
  items: AuditEntityLicenseType[];
};

export type AuditEntityLicenseStatus =
  | "valid"
  | "expired"
  | "pending"
  | "suspended"
  | "cancelled"
  | "not_applicable";

export type AuditEntityLicense = {
  id: number;
  audit_entity_id: number;
  license_type_id: number;
  license_no: string;
  license_name: string | null;
  issuing_authority: string | null;
  issuing_country: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  renewal_due_date: string | null;
  license_status: AuditEntityLicenseStatus;
  document_reference: string | null;
  is_mandatory: boolean;
  is_verified: boolean;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityLicenseListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityLicense[];
};

export type AuditEntityLicensePayload = {
  audit_entity_id: number;
  license_type_id: number;
  license_no: string;
  license_name?: string | null;
  issuing_authority?: string | null;
  issuing_country?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  renewal_due_date?: string | null;
  license_status: AuditEntityLicenseStatus;
  document_reference?: string | null;
  is_mandatory: boolean;
  is_verified: boolean;
  remarks?: string | null;
};

export type AuditEntityLicenseUpdatePayload =
  Partial<AuditEntityLicensePayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  licenseTypeId?: number;
  licenseStatus?: AuditEntityLicenseStatus;
  isMandatory?: boolean;
  isVerified?: boolean;
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

  if (params.licenseTypeId) {
    query.set("license_type_id", String(params.licenseTypeId));
  }

  if (params.licenseStatus) {
    query.set("license_status", params.licenseStatus);
  }

  if (typeof params.isMandatory === "boolean") {
    query.set("is_mandatory", String(params.isMandatory));
  }

  if (typeof params.isVerified === "boolean") {
    query.set("is_verified", String(params.isVerified));
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
      error?.detail || error?.message || "Audit entity license request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityLicenseTypes(isActive = true) {
  return requestJson<AuditEntityLicenseTypeListResponse>(
    `/api/backend/audit-entity-licenses/types?is_active=${String(isActive)}`,
    {
      method: "GET",
    },
  );
}

export async function listAuditEntityLicenses(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityLicenseListResponse>(
    `/api/backend/audit-entity-licenses?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityLicense(
  payload: AuditEntityLicensePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityLicense;
  }>("/api/backend/audit-entity-licenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityLicense(
  id: number,
  payload: AuditEntityLicenseUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityLicense;
  }>(`/api/backend/audit-entity-licenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityLicense(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityLicense;
  }>(`/api/backend/audit-entity-licenses/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityLicense(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityLicense;
  }>(`/api/backend/audit-entity-licenses/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityLicense(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-licenses/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
