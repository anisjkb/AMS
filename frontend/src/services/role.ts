
// E:\Audit\AMS\frontend\src\services\role.ts

import type {
  Role,
  RoleListResponse,
  RoleMessageResponse,
  RolePayload,
} from "@/types/role";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type RoleListParams = PaginationParams & {
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

const buildRoleSearchParams = (params: RoleListParams = {}) => {
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

export const getRoles = async (
  params: RoleListParams = {}
): Promise<RoleListResponse> => {
  const searchParams = buildRoleSearchParams(params);

  return requestJson<RoleListResponse>(
    `/api/backend/roles?${searchParams.toString()}`
  );
};

export const getAllRoles = async (
  params: RoleListParams = {}
): Promise<RoleListResponse> => {
  const firstPage = await getRoles({
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

  const allItems: Role[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getRoles({
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

export const createRole = async (
  payload: RolePayload
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>("/api/backend/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateRole = async (
  roleId: number,
  payload: RolePayload
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(`/api/backend/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateRole = async (
  roleId: number
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(`/api/backend/roles/${roleId}`, {
    method: "DELETE",
  });
};

export const restoreRole = async (
  roleId: number
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(
    `/api/backend/roles/${roleId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteRole = async (
  roleId: number
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(
    `/api/backend/roles/${roleId}/permanent`,
    {
      method: "DELETE",
    }
  );
};