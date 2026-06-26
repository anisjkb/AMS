
// E:\Audit\AMS\frontend\src\services\menuPermission.ts

import type {
  MenuLookup,
  MenuPermission,
  MenuPermissionMessageResponse,
  MenuPermissionPayload,
} from "@/types/menuPermission";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type MenuPermissionListApiResponse =
  | MenuPermission[]
  | {
      data?: MenuPermission[] | MenuPermission | null;
      items?: MenuPermission[];
      results?: MenuPermission[];
      message?: string;
    };

type MenuLookupListApiResponse =
  | MenuLookup[]
  | {
      data?: MenuLookup[] | MenuLookup | null;
      items?: MenuLookup[];
      results?: MenuLookup[];
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

const normalizeMenuList = (response: MenuLookupListApiResponse): MenuLookup[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && isRecord(response.data)) return [response.data as MenuLookup];

  return [];
};

const normalizeMenuPermissionList = (
  response: MenuPermissionListApiResponse
): MenuPermission[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && isRecord(response.data)) {
    return [response.data as MenuPermission];
  }

  return [];
};

export const getMenusForPermissionMapping = async (): Promise<MenuLookup[]> => {
  const response = await requestJson<MenuLookupListApiResponse>(
    "/api/backend/menu-permissions/menus"
  );

  return normalizeMenuList(response);
};

export const getMenuPermissionsByMenu = async (
  menuId: number
): Promise<MenuPermission[]> => {
  const response = await requestJson<MenuPermissionListApiResponse>(
    `/api/backend/menu-permissions/menus/${menuId}/permissions`
  );

  return normalizeMenuPermissionList(response);
};

export const assignPermissionToMenu = async (
  payload: MenuPermissionPayload
): Promise<MenuPermissionMessageResponse> => {
  return requestJson<MenuPermissionMessageResponse>("/api/backend/menu-permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const removeMenuPermission = async (
  menuPermissionId: number
): Promise<MenuPermissionMessageResponse> => {
  return requestJson<MenuPermissionMessageResponse>(
    `/api/backend/menu-permissions/${menuPermissionId}`,
    {
      method: "DELETE",
    }
  );
};