
// E:\Audit\AMS\frontend\src\services\department.ts

import type {
  Department,
  DepartmentCreatePayload,
  DepartmentListResponse,
  DepartmentMessageResponse,
  DepartmentUpdatePayload,
} from "@/types/department";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type RawDepartmentListResponse = {
  items: Department[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

export type DepartmentListParams = PaginationParams & {
  status?: StatusFilter;
  companyId?: number | null;
  branchId?: number | null;
};

export type DepartmentPayload = DepartmentCreatePayload;

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

const normalizeDepartmentListResponse = (
  response: RawDepartmentListResponse
): DepartmentListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildDepartmentSearchParams = (params: DepartmentListParams = {}) => {
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

  return searchParams;
};

export const getDepartmentsPage = async (
  params: DepartmentListParams = {}
): Promise<DepartmentListResponse> => {
  const searchParams = buildDepartmentSearchParams(params);

  const response = await requestJson<RawDepartmentListResponse>(
    `/api/backend/departments?${searchParams.toString()}`
  );

  return normalizeDepartmentListResponse(response);
};

export const getAllDepartments = async (
  params: DepartmentListParams = {}
): Promise<DepartmentListResponse> => {
  const firstPage = await getDepartmentsPage({
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

  const allItems: Department[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getDepartmentsPage({
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

// Keep this lookup-friendly for Designation/Employee forms.
export const getDepartments = async (
  params: DepartmentListParams = {}
): Promise<Department[]> => {
  const response = await getAllDepartments(params);
  return response.items;
};

export const createDepartment = async (
  payload: DepartmentCreatePayload
): Promise<DepartmentMessageResponse> => {
  return requestJson<DepartmentMessageResponse>("/api/backend/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateDepartment = async (
  departmentId: number,
  payload: DepartmentUpdatePayload
): Promise<DepartmentMessageResponse> => {
  return requestJson<DepartmentMessageResponse>(
    `/api/backend/departments/${departmentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivateDepartment = async (
  departmentId: number
): Promise<DepartmentMessageResponse> => {
  return requestJson<DepartmentMessageResponse>(
    `/api/backend/departments/${departmentId}`,
    {
      method: "DELETE",
    }
  );
};

export const restoreDepartment = async (
  departmentId: number
): Promise<DepartmentMessageResponse> => {
  return requestJson<DepartmentMessageResponse>(
    `/api/backend/departments/${departmentId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteDepartment = async (
  departmentId: number
): Promise<DepartmentMessageResponse> => {
  return requestJson<DepartmentMessageResponse>(
    `/api/backend/departments/${departmentId}/permanent`,
    {
      method: "DELETE",
    }
  );
};