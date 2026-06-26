export type AuditEntityFacilityType = {
  id: number;
  facility_type_code: string;
  facility_type_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityFacilityTypeListResponse = {
  total: number;
  items: AuditEntityFacilityType[];
};

export type AuditEntityFacilityStatus =
  | "operational"
  | "under_construction"
  | "temporarily_closed"
  | "closed"
  | "inactive";

export type AuditEntityFacilityOwnershipType =
  | "owned"
  | "rented"
  | "leased"
  | "third_party"
  | "shared"
  | "other";

export type AuditEntityFacility = {
  id: number;
  audit_entity_id: number;
  facility_type_id: number;
  facility_code: string | null;
  facility_name: string;
  facility_status: AuditEntityFacilityStatus;
  ownership_type: AuditEntityFacilityOwnershipType | null;
  registration_no: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  division_code: string | null;
  district_code: string | null;
  upazila_code: string | null;
  post_code: string | null;
  city: string | null;
  country: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  floor_area_sqft: string | number | null;
  production_capacity: string | null;
  number_of_employees: number | null;
  opening_date: string | null;
  closing_date: string | null;
  is_primary: boolean;
  is_operational: boolean;
  description: string | null;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityFacilityListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityFacility[];
};

export type AuditEntityFacilityPayload = {
  audit_entity_id: number;
  facility_type_id: number;
  facility_code?: string | null;
  facility_name: string;
  facility_status: AuditEntityFacilityStatus;
  ownership_type?: AuditEntityFacilityOwnershipType | null;
  registration_no?: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  division_code?: string | null;
  district_code?: string | null;
  upazila_code?: string | null;
  post_code?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  floor_area_sqft?: number | null;
  production_capacity?: string | null;
  number_of_employees?: number | null;
  opening_date?: string | null;
  closing_date?: string | null;
  is_primary: boolean;
  is_operational: boolean;
  description?: string | null;
  remarks?: string | null;
};

export type AuditEntityFacilityUpdatePayload =
  Partial<AuditEntityFacilityPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  facilityTypeId?: number;
  facilityStatus?: AuditEntityFacilityStatus;
  ownershipType?: AuditEntityFacilityOwnershipType;
  isPrimary?: boolean;
  isOperational?: boolean;
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

  if (params.facilityTypeId) {
    query.set("facility_type_id", String(params.facilityTypeId));
  }

  if (params.facilityStatus) {
    query.set("facility_status", params.facilityStatus);
  }

  if (params.ownershipType) {
    query.set("ownership_type", params.ownershipType);
  }

  if (typeof params.isPrimary === "boolean") {
    query.set("is_primary", String(params.isPrimary));
  }

  if (typeof params.isOperational === "boolean") {
    query.set("is_operational", String(params.isOperational));
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
      "Audit entity facility request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityFacilityTypes(isActive = true) {
  return requestJson<AuditEntityFacilityTypeListResponse>(
    `/api/backend/audit-entity-facilities/types?is_active=${String(isActive)}`,
    {
      method: "GET",
    },
  );
}

export async function listAuditEntityFacilities(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityFacilityListResponse>(
    `/api/backend/audit-entity-facilities?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityFacility(
  payload: AuditEntityFacilityPayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityFacility;
  }>("/api/backend/audit-entity-facilities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityFacility(
  id: number,
  payload: AuditEntityFacilityUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityFacility;
  }>(`/api/backend/audit-entity-facilities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityFacility(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityFacility;
  }>(`/api/backend/audit-entity-facilities/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityFacility(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityFacility;
  }>(`/api/backend/audit-entity-facilities/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityFacility(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-facilities/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
