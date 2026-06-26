export type BusinessNature = {
  id: number;
  nature_code: string;
  nature_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BusinessSector = {
  id: number;
  nature_id: number;
  sector_code: string;
  sector_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BusinessIndustry = {
  id: number;
  sector_id: number;
  industry_code: string;
  industry_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error?.detail || error?.message || "Business Master request failed.";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function listBusinessNatures() {
  return requestJson<BusinessNature[]>(
    "/api/backend/business-masters/natures",
  );
}

export async function listBusinessSectors(natureId?: number) {
  const query = new URLSearchParams();

  if (natureId) {
    query.set("nature_id", String(natureId));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return requestJson<BusinessSector[]>(
    `/api/backend/business-masters/sectors${suffix}`,
  );
}

export async function listBusinessIndustries(sectorId?: number) {
  const query = new URLSearchParams();

  if (sectorId) {
    query.set("sector_id", String(sectorId));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return requestJson<BusinessIndustry[]>(
    `/api/backend/business-masters/industries${suffix}`,
  );
}
