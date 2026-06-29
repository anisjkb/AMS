import type {
  MenuActionCreatePayload,
  MenuActionListResponse,
  MenuActionMessageResponse,
  MenuActionQueryParams,
  MenuActionUpdatePayload,
} from "@/types/menuAction";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

const BASE_URL = "/api/backend/menu-actions";

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
        .map((item) => item.msg || item.message || "Validation error")
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

  return response.json() as Promise<T>;
};

const buildQuery = (params: MenuActionQueryParams = {}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("page_size", String(params.pageSize ?? 20));
  query.set("sort_by", params.sortBy ?? "sort_order");
  query.set("sort_order", params.sortOrder ?? "asc");

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.menuId) {
    query.set("menu_id", String(params.menuId));
  }

  if (params.visibility === "visible") {
    query.set("is_visible", "true");
  }

  if (params.visibility === "hidden") {
    query.set("is_visible", "false");
  }

  if (params.status === "active") {
    query.set("is_active", "true");
  }

  if (params.status === "inactive") {
    query.set("is_active", "false");
  }

  return query.toString();
};

export const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const getMenuActionsPage = async (
  params: MenuActionQueryParams = {}
): Promise<MenuActionListResponse> => {
  return requestJson<MenuActionListResponse>(
    `${BASE_URL}?${buildQuery(params)}`
  );
};

export const getAllMenuActions = async (
  params: Omit<MenuActionQueryParams, "page" | "pageSize"> = {}
): Promise<MenuActionListResponse> => {
  return getMenuActionsPage({
    ...params,
    page: 1,
    pageSize: 100,
  });
};

export const createMenuAction = async (
  payload: MenuActionCreatePayload
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateMenuAction = async (
  actionId: number,
  payload: MenuActionUpdatePayload
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(`${BASE_URL}/${actionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateMenuAction = async (
  actionId: number
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(`${BASE_URL}/${actionId}`, {
    method: "DELETE",
  });
};

export const restoreMenuAction = async (
  actionId: number
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(
    `${BASE_URL}/${actionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteMenuAction = async (
  actionId: number
): Promise<MenuActionMessageResponse> => {
  return requestJson<MenuActionMessageResponse>(
    `${BASE_URL}/${actionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
