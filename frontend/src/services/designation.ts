// E:\Audit\AMS\frontend\src\services\designation.ts

import type {
  Designation,
  DesignationCreatePayload,
  DesignationListResponse,
  DesignationMessageResponse,
  DesignationUpdatePayload,
} from "@/types/designation";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type RawDesignationListResponse = {
  items: Designation[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

export type DesignationListParams = PaginationParams & {
  status?: StatusFilter;
  companyId?: number | null;
  branchId?: number | null;
  departmentId?: number | null;
};

export type DesignationPayload = DesignationCreatePayload;

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

const normalizeDesignationListResponse = (
  response: RawDesignationListResponse
): DesignationListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildDesignationSearchParams = (params: DesignationListParams = {}) => {
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

  if (params.branchId) {
    searchParams.set("branch_id", String(params.branchId));
  }

  if (params.departmentId) {
    searchParams.set("department_id", String(params.departmentId));
  }

  return searchParams;
};

export const getDesignationsPage = async (
  params: DesignationListParams = {}
): Promise<DesignationListResponse> => {
  const searchParams = buildDesignationSearchParams(params);

  const response = await requestJson<RawDesignationListResponse>(
    `/api/backend/designations?${searchParams.toString()}`
  );

  return normalizeDesignationListResponse(response);
};

export const getAllDesignations = async (
  params: DesignationListParams = {}
): Promise<DesignationListResponse> => {
  const firstPage = await getDesignationsPage({
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

  const allItems: Designation[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getDesignationsPage({
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

// Keep this lookup-friendly for Employee forms/dropdowns.
export const getDesignations = async (
  params: DesignationListParams = {}
): Promise<Designation[]> => {
  const response = await getAllDesignations(params);
  return response.items;
};

export const createDesignation = async (
  payload: DesignationCreatePayload
): Promise<DesignationMessageResponse> => {
  return requestJson<DesignationMessageResponse>("/api/backend/designations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateDesignation = async (
  designationId: number,
  payload: DesignationUpdatePayload
): Promise<DesignationMessageResponse> => {
  return requestJson<DesignationMessageResponse>(
    `/api/backend/designations/${designationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivateDesignation = async (
  designationId: number
): Promise<DesignationMessageResponse> => {
  return requestJson<DesignationMessageResponse>(
    `/api/backend/designations/${designationId}`,
    {
      method: "DELETE",
    }
  );
};

export const restoreDesignation = async (
  designationId: number
): Promise<DesignationMessageResponse> => {
  return requestJson<DesignationMessageResponse>(
    `/api/backend/designations/${designationId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteDesignation = async (
  designationId: number
): Promise<DesignationMessageResponse> => {
  return requestJson<DesignationMessageResponse>(
    `/api/backend/designations/${designationId}/permanent`,
    {
      method: "DELETE",
    }
  );
};