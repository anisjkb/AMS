
// E:\Audit\AMS\frontend\src\services\menuActionPermission.ts

import type {
  MenuActionLookup,
  MenuActionPermission,
  MenuActionPermissionMessageResponse,
  MenuActionPermissionPayload,
} from "@/types/menuActionPermission";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type MenuActionLookupListApiResponse =
  | MenuActionLookup[]
  | {
      data?: MenuActionLookup[] | MenuActionLookup | null;
      items?: MenuActionLookup[];
      results?: MenuActionLookup[];
      message?: string;
    };

type MenuActionPermissionListApiResponse =
  | MenuActionPermission[]
  | {
      data?: MenuActionPermission[] | MenuActionPermission | null;
      items?: MenuActionPermission[];
      results?: MenuActionPermission[];
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

const normalizeActionList = (
  response: MenuActionLookupListApiResponse
): MenuActionLookup[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && isRecord(response.data)) {
    return [response.data as MenuActionLookup];
  }

  return [];
};

const normalizeMappingList = (
  response: MenuActionPermissionListApiResponse
): MenuActionPermission[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && isRecord(response.data)) {
    return [response.data as MenuActionPermission];
  }

  return [];
};

export const getMenuActionsForPermissionMapping = async (): Promise<
  MenuActionLookup[]
> => {
  const response = await requestJson<MenuActionLookupListApiResponse>(
    "/api/backend/menu-action-permissions/actions"
  );

  return normalizeActionList(response);
};

export const getMenuActionPermissionsByAction = async (
  menuActionId: number
): Promise<MenuActionPermission[]> => {
  const response = await requestJson<MenuActionPermissionListApiResponse>(
    `/api/backend/menu-action-permissions/actions/${menuActionId}/permissions`
  );

  return normalizeMappingList(response);
};

export const assignPermissionToMenuAction = async (
  payload: MenuActionPermissionPayload
): Promise<MenuActionPermissionMessageResponse> => {
  return requestJson<MenuActionPermissionMessageResponse>(
    "/api/backend/menu-action-permissions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};

export const removeMenuActionPermission = async (
  menuActionPermissionId: number
): Promise<MenuActionPermissionMessageResponse> => {
  return requestJson<MenuActionPermissionMessageResponse>(
    `/api/backend/menu-action-permissions/${menuActionPermissionId}`,
    {
      method: "DELETE",
    }
  );
};