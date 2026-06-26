// E:\Audit\AMS\frontend\src\services\permission.ts

import type {
  Permission,
  PermissionListResponse,
  PermissionMessageResponse,
  PermissionPayload,
} from "@/types/permission";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type PermissionListParams = PaginationParams & {
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

const buildPermissionSearchParams = (params: PermissionListParams = {}) => {
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

export const getPermissions = async (
  params: PermissionListParams = {}
): Promise<PermissionListResponse> => {
  const searchParams = buildPermissionSearchParams(params);

  return requestJson<PermissionListResponse>(
    `/api/backend/permissions?${searchParams.toString()}`
  );
};

export const getAllPermissions = async (
  params: PermissionListParams = {}
): Promise<PermissionListResponse> => {
  const firstPage = await getPermissions({
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

  const allItems: Permission[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getPermissions({
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

export const createPermission = async (
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>("/api/backend/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updatePermission = async (
  permissionId: number,
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivatePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "DELETE",
    }
  );
};

export const restorePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeletePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};