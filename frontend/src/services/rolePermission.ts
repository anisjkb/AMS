
// E:\Audit\AMS\frontend\src\services\rolePermission.ts

import type {
  RolePermission,
  RolePermissionMessageResponse,
  RolePermissionPayload,
} from "@/types/rolePermission";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type RolePermissionListApiResponse =
  | RolePermission[]
  | {
      data?: RolePermission[] | RolePermission | null;
      items?: RolePermission[];
      results?: RolePermission[];
      message?: string;
    };

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

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

const normalizeRolePermissionList = (
  response: RolePermissionListApiResponse
): RolePermission[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && isRecord(response.data)) {
    return [response.data as RolePermission];
  }

  return [];
};

export const getRolePermissionsByRole = async (
  roleId: number
): Promise<RolePermission[]> => {
  const response = await requestJson<RolePermissionListApiResponse>(
    `/api/backend/role-permissions/roles/${roleId}/permissions`
  );

  return normalizeRolePermissionList(response);
};

export const assignPermissionToRole = async (
  payload: RolePermissionPayload
): Promise<RolePermissionMessageResponse> => {
  return requestJson<RolePermissionMessageResponse>("/api/backend/role-permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const removeRolePermission = async (
  rolePermissionId: number
): Promise<RolePermissionMessageResponse> => {
  return requestJson<RolePermissionMessageResponse>(
    `/api/backend/role-permissions/${rolePermissionId}`,
    {
      method: "DELETE",
    }
  );
};