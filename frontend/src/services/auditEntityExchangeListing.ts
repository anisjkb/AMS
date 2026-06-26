export type AuditEntityExchangeListing = {
  id: number;
  audit_entity_id: number;
  listing_code: string;
  stock_exchange: string;
  trading_code: string | null;
  scrip_code: string | null;
  isin_code: string | null;
  market_category: string | null;
  listed_sector: string | null;
  listing_date: string | null;
  listing_status: string;
  is_primary_listing: boolean;
  remarks: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditEntityExchangeListingListResponse = {
  total: number;
  page: number;
  page_size: number;
  items: AuditEntityExchangeListing[];
};

export type AuditEntityExchangeListingPayload = {
  audit_entity_id: number;
  listing_code?: string | null;
  stock_exchange: string;
  trading_code?: string | null;
  scrip_code?: string | null;
  isin_code?: string | null;
  market_category?: string | null;
  listed_sector?: string | null;
  listing_date?: string | null;
  listing_status: string;
  is_primary_listing: boolean;
  remarks?: string | null;
};

export type AuditEntityExchangeListingUpdatePayload =
  Partial<AuditEntityExchangeListingPayload> & {
    is_active?: boolean;
  };

type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  auditEntityId?: number;
  stockExchange?: string;
  listingStatus?: string;
  isPrimaryListing?: boolean;
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

  if (params.stockExchange) {
    query.set("stock_exchange", params.stockExchange);
  }

  if (params.listingStatus) {
    query.set("listing_status", params.listingStatus);
  }

  if (typeof params.isPrimaryListing === "boolean") {
    query.set("is_primary_listing", String(params.isPrimaryListing));
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
      "Audit entity exchange listing request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listAuditEntityExchangeListings(params: ListParams) {
  const query = buildQuery(params);

  return requestJson<AuditEntityExchangeListingListResponse>(
    `/api/backend/audit-entity-exchange-listings?${query}`,
    {
      method: "GET",
    },
  );
}

export async function createAuditEntityExchangeListing(
  payload: AuditEntityExchangeListingPayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityExchangeListing;
  }>("/api/backend/audit-entity-exchange-listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAuditEntityExchangeListing(
  id: number,
  payload: AuditEntityExchangeListingUpdatePayload,
) {
  return requestJson<{
    message: string;
    data: AuditEntityExchangeListing;
  }>(`/api/backend/audit-entity-exchange-listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deactivateAuditEntityExchangeListing(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityExchangeListing;
  }>(`/api/backend/audit-entity-exchange-listings/${id}`, {
    method: "DELETE",
  });
}

export async function restoreAuditEntityExchangeListing(id: number) {
  return requestJson<{
    message: string;
    data: AuditEntityExchangeListing;
  }>(`/api/backend/audit-entity-exchange-listings/${id}/restore`, {
    method: "PATCH",
  });
}

export async function permanentDeleteAuditEntityExchangeListing(id: number) {
  return requestJson<{ message: string; data: null }>(
    `/api/backend/audit-entity-exchange-listings/${id}/permanent`,
    {
      method: "DELETE",
    },
  );
}
