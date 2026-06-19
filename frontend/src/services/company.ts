import type {
  Company,
  CompanyCreatePayload,
} from "@/types/company";

type CompanyListResponse =
  | Company[]
  | {
      data?: Company[];
      items?: Company[];
      results?: Company[];
      companies?: Company[];
    };

const normalizeCompanies = (response: CompanyListResponse): Company[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.companies)) {
    return response.companies;
  }

  return [];
};

export const getCompanies = async (): Promise<Company[]> => {
  const response = await fetch("/api/companies", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load companies");
  }

  const data = (await response.json()) as CompanyListResponse;

  return normalizeCompanies(data);
};

export const createCompany = async (
  payload: CompanyCreatePayload
): Promise<Company> => {
  const response = await fetch("/api/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to create company");
  }

  return response.json();
};


export const updateCompany = async (
  id: number,
  payload: CompanyCreatePayload
): Promise<Company> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to update company");
  }

  return response.json();
};
export const deactivateCompany = async (id: number): Promise<Company> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      is_active: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to delete company");
  }

  return response.json();
};

export const restoreCompany = async (id: number): Promise<Company> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      is_active: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to restore company");
  }

  return response.json();
};

export const permanentlyDeleteCompany = async (id: number): Promise<void> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to permanently delete company"
    );
  }
};