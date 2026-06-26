// E:\Audit\AMS\frontend\src\services\branch.ts

import type { Branch } from "@/types/branch";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

export type BranchListResponse = {
  items: Branch[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type RawBranchListResponse = {
  items: Branch[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

type BranchPayload = {
  branch_name: string;
  branch_code?: string | null;
  company_id: number;
  branch_email?: string | null;
  branch_phone?: string | null;
  branch_address?: string | null;
  remarks?: string | null;
};

type BranchMessageResponse = {
  message: string;
  data: Branch | null;
};

type BranchListParams = PaginationParams & {
  status?: StatusFilter;
  companyId?: number | null;
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

const normalizeBranchListResponse = (
  response: RawBranchListResponse
): BranchListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildBranchSearchParams = (params: BranchListParams = {}) => {
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

  if (params.companyId) {
    searchParams.set("company_id", String(params.companyId));
  }

  return searchParams;
};

export const getBranchesPage = async (
  params: BranchListParams = {}
): Promise<BranchListResponse> => {
  const searchParams = buildBranchSearchParams(params);

  const response = await requestJson<RawBranchListResponse>(
    `/api/backend/branches?${searchParams.toString()}`
  );

  return normalizeBranchListResponse(response);
};

export const getAllBranches = async (
  params: BranchListParams = {}
): Promise<BranchListResponse> => {
  const firstPage = await getBranchesPage({
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

  const allItems: Branch[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getBranchesPage({
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

// Keep this lookup-friendly for forms/dropdowns.
export const getBranches = async (
  params: BranchListParams = {}
): Promise<Branch[]> => {
  const response = await getAllBranches(params);
  return response.items;
};

export const createBranch = async (
  payload: BranchPayload
): Promise<BranchMessageResponse> => {
  return requestJson<BranchMessageResponse>("/api/backend/branches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateBranch = async (
  branchId: number,
  payload: BranchPayload
): Promise<BranchMessageResponse> => {
  return requestJson<BranchMessageResponse>(`/api/backend/branches/${branchId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateBranch = async (
  branchId: number
): Promise<BranchMessageResponse> => {
  return requestJson<BranchMessageResponse>(`/api/backend/branches/${branchId}`, {
    method: "DELETE",
  });
};

export const restoreBranch = async (
  branchId: number
): Promise<BranchMessageResponse> => {
  return requestJson<BranchMessageResponse>(
    `/api/backend/branches/${branchId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteBranch = async (
  branchId: number
): Promise<BranchMessageResponse> => {
  return requestJson<BranchMessageResponse>(
    `/api/backend/branches/${branchId}/permanent`,
    {
      method: "DELETE",
    }
  );
};