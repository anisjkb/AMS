// E:\Audit\AMS\frontend\src\services\employee.ts

import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeListResponse,
  EmployeeMessageResponse,
  EmployeeUpdatePayload,
} from "@/types/employee";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type RawEmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

export type EmployeeListParams = PaginationParams & {
  status?: StatusFilter;
  companyId?: number | null;
  branchId?: number | null;
  departmentId?: number | null;
  designationId?: number | null;
  employeeStatus?: string | null;
};

export type EmployeePayload = EmployeeCreatePayload;

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

const normalizeEmployeeListResponse = (
  response: RawEmployeeListResponse
): EmployeeListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildEmployeeSearchParams = (params: EmployeeListParams = {}) => {
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

  if (params.designationId) {
    searchParams.set("designation_id", String(params.designationId));
  }

  if (params.employeeStatus?.trim()) {
    searchParams.set("employee_status", params.employeeStatus.trim());
  }

  return searchParams;
};

export const getEmployeeMediaUrl = (
  mediaPath?: string | null
): string | null => {
  if (!mediaPath) {
    return null;
  }

  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
    return mediaPath;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

  const backendBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  const normalizedPath = mediaPath.startsWith("/")
    ? mediaPath
    : `/${mediaPath}`;

  return `${backendBaseUrl}${normalizedPath}`;
};

export const getEmployees = async (
  params: EmployeeListParams = {}
): Promise<EmployeeListResponse> => {
  const searchParams = buildEmployeeSearchParams(params);

  const response = await requestJson<RawEmployeeListResponse>(
    `/api/backend/employees?${searchParams.toString()}`
  );

  return normalizeEmployeeListResponse(response);
};

export const getAllEmployees = async (
  params: EmployeeListParams = {}
): Promise<EmployeeListResponse> => {
  const firstPage = await getEmployees({
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

  const allItems: Employee[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getEmployees({
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

export const createEmployee = async (
  payload: EmployeeCreatePayload
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>("/api/backend/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateEmployee = async (
  employeeId: number,
  payload: EmployeeUpdatePayload
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivateEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}`,
    {
      method: "DELETE",
    }
  );
};

export const restoreEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/permanent`,
    {
      method: "DELETE",
    }
  );
};

export const uploadEmployeePhoto = async (
  employeeId: number,
  file: File
): Promise<EmployeeMessageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/backend/employees/${employeeId}/photo`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const deleteEmployeePhoto = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/photo`,
    {
      method: "DELETE",
    }
  );
};