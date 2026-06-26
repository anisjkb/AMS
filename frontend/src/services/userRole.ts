// E:\Audit\AMS\frontend\src\services\userRole.ts

import type {
  UserRole,
  UserRoleMessageResponse,
  UserRolePayload,
} from "@/types/userRole";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type UserRoleListApiResponse =
  | UserRole[]
  | {
      data?: UserRole[] | UserRole | null;
      items?: UserRole[];
      results?: UserRole[];
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

const normalizeUserRoleList = (
  response: UserRoleListApiResponse
): UserRole[] => {
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
    return [response.data as UserRole];
  }

  return [];
};

export const getUserRolesByUser = async (
  userId: number
): Promise<UserRole[]> => {
  const response = await requestJson<UserRoleListApiResponse>(
    `/api/backend/user-roles/users/${userId}/roles`
  );

  return normalizeUserRoleList(response);
};

export const assignRoleToUser = async (
  payload: UserRolePayload
): Promise<UserRoleMessageResponse> => {
  return requestJson<UserRoleMessageResponse>("/api/backend/user-roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const removeUserRole = async (
  userRoleId: number
): Promise<UserRoleMessageResponse> => {
  return requestJson<UserRoleMessageResponse>(
    `/api/backend/user-roles/${userRoleId}`,
    {
      method: "DELETE",
    }
  );
};