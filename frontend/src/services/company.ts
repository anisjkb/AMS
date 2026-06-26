// E:\Audit\AMS\frontend\src\services\company.ts

import type { Company } from "@/types/company";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type CompanyPayload = {
  company_name: string;
  company_code?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  company_address?: string | null;
};

type CompanyMessageResponse = {
  message: string;
  data: Company | null;
};

export type CompanyListResponse = {
  items: Company[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type RawCompanyListResponse = {
  items: Company[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

type CompanyListParams = PaginationParams & {
  status?: StatusFilter;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const normalizeCompanyListResponse = (
  response: RawCompanyListResponse
): CompanyListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildCompanySearchParams = (params: CompanyListParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: params.sortBy ?? "id",
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status === "active") {
    searchParams.set("is_active", "true");
  }

  if (params.status === "inactive") {
    searchParams.set("is_active", "false");
  }

  return searchParams;
};

export const getCompaniesPage = async (
  params: CompanyListParams = {}
): Promise<CompanyListResponse> => {
  const searchParams = buildCompanySearchParams(params);

  const response = await requestJson<RawCompanyListResponse>(
    `/api/backend/companies?${searchParams.toString()}`
  );

  return normalizeCompanyListResponse(response);
};

export const getAllCompanies = async (
  params: CompanyListParams = {}
): Promise<CompanyListResponse> => {
  const firstPage = await getCompaniesPage({
    ...params,
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  });

  if (firstPage.total_pages <= 1) {
    return {
      ...firstPage,
      page: 1,
      page_size: firstPage.items.length,
      total_pages: 1,
    };
  }

  const allItems: Company[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getCompaniesPage({
      ...params,
      page,
      pageSize: MAX_PAGE_SIZE,
    });

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    total: firstPage.total,
    page: 1,
    page_size: allItems.length,
    total_pages: 1,
  };
};

// Keep this old name lookup-friendly for Department/Branch/Employee forms.
export const getCompanies = async (
  params: CompanyListParams = {}
): Promise<Company[]> => {
  const response = await getAllCompanies(params);
  return response.items;
};

export const createCompany = async (
  payload: CompanyPayload
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>("/api/backend/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateCompany = async (
  companyId: number,
  payload: CompanyPayload
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivateCompany = async (
  companyId: number
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}`,
    {
      method: "DELETE",
    }
  );
};

export const restoreCompany = async (
  companyId: number
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteCompany = async (
  companyId: number
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}/permanent`,
    {
      method: "DELETE",
    }
  );
};